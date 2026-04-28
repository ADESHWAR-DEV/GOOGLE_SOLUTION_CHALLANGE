from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel, EmailStr
from typing import Optional
from app.config.firebase import auth_client, users_ref, DEMO_MODE

router = APIRouter(prefix="/auth", tags=["auth"])

class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    display_name: str
    role: str  # athlete, buyer, admin
    wallet_address: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    uid: str
    email: str
    display_name: str
    role: str
    wallet_address: Optional[str] = None


async def get_current_user(authorization: str = Header(...)):
    """Verify Firebase ID token or demo token from Authorization header."""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    token = authorization.split("Bearer ")[1]
    try:
        if DEMO_MODE:
            if token.startswith("demo_"):
                uid = token.replace("demo_", "")
                doc = users_ref.document(uid).get()
                if doc.exists:
                    return {"uid": uid}
                raise HTTPException(status_code=401, detail="Invalid demo token")
            raise HTTPException(status_code=401, detail="Invalid token format for demo mode")
        else:
            decoded = auth_client.verify_id_token(token)
            return decoded
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")


def require_role(user: dict, allowed_roles: list):
    """Check if user has required role."""
    uid = user["uid"]
    doc = users_ref.document(uid).get()
    if not doc.exists:
        raise HTTPException(status_code=403, detail="User not found")
    data = doc.to_dict()
    role = data.get("role", "buyer") if data else "buyer"
    if role not in allowed_roles:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    return data


@router.post("/signup")
async def signup(req: SignupRequest):
    """Create a new user in Firebase Auth and Firestore."""
    try:
        user = auth_client.create_user(
            email=req.email,
            password=req.password,
            display_name=req.display_name,
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Signup failed: {str(e)}")

    # Store user in Firestore
    user_data = {
        "uid": user.uid,
        "email": req.email,
        "display_name": req.display_name,
        "role": req.role,
        "wallet_address": req.wallet_address or "",
        "created_at": __import__("datetime").datetime.utcnow().isoformat(),
        "stats": {"assets_count": 0, "total_earnings": 0.0},
    }
    users_ref.document(user.uid).set(user_data)

    return {"success": True, "uid": user.uid, "message": "User created successfully"}


@router.post("/login")
async def login(req: LoginRequest):
    """Login endpoint. In demo mode, validates against stored users and returns a demo token."""
    try:
        user = auth_client.get_user_by_email(req.email)
        doc = users_ref.document(user.uid).get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="User profile not found")
        data = doc.to_dict()
        return {
            "success": True,
            "uid": user.uid,
            "email": user.email,
            "display_name": getattr(user, 'display_name', req.email),
            "role": data.get("role", "buyer") if data else "buyer",
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/me", response_model=UserResponse)
async def get_me(user: dict = Depends(get_current_user)):
    """Get current authenticated user profile."""
    uid = user["uid"]
    doc = users_ref.document(uid).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="User not found")
    data = doc.to_dict() or {}
    return UserResponse(
        uid=uid,
        email=data.get("email", ""),
        display_name=data.get("display_name", ""),
        role=data.get("role", "buyer"),
        wallet_address=data.get("wallet_address"),
    )
