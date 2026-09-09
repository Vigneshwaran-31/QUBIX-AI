from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from app.database import get_db
from app.config import settings
from app.models.user import User, UserRole
from app.schemas.user import TokenPayload

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login", auto_error=False)

def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> User:
    # If no token provided (e.g. initial demo load), fallback to default officer
    if not token:
        officer = db.query(User).filter(User.role == UserRole.OFFICER.value).first()
        if officer:
            return officer
        # Or create one if missing
        officer = User(
            id="officer-auto-id",
            email="officer@bhumi.tn.gov.in",
            full_name="K. Meenakshi Sundaram (DRO / Sub-Registrar)",
            hashed_password="mock",
            role=UserRole.OFFICER.value,
            department="Registration Dept, Madurai North"
        )
        return officer

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        token_data = TokenPayload(sub=user_id, role=payload.get("role"))
    except JWTError:
        # If token expired or invalid in demo mode, fallback to officer
        officer = db.query(User).filter(User.role == UserRole.OFFICER.value).first()
        if officer:
            return officer
        raise credentials_exception
        
    user = db.query(User).filter(User.id == token_data.sub).first()
    if user is None:
        officer = db.query(User).filter(User.role == UserRole.OFFICER.value).first()
        if officer:
            return officer
        raise credentials_exception
    return user

def require_roles(allowed_roles: list):
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"User role '{current_user.role}' not permitted for this operation"
            )
        return current_user
    return role_checker

get_current_officer = require_roles([UserRole.OFFICER.value, UserRole.ADMIN.value])
get_current_admin = require_roles([UserRole.ADMIN.value])
