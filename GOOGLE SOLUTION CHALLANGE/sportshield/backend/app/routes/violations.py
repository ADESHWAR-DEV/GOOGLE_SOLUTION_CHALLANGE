from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from app.config.firebase import violations_ref, assets_ref
from app.routes.auth import get_current_user, require_role

router = APIRouter(prefix="/violations", tags=["violations"])

class DisputeRequest(BaseModel):
    violation_id: str
    resolution: str  # approve, reject
    notes: Optional[str] = ""

@router.get("/")
async def list_violations(
    status: Optional[str] = Query(None),
    user: dict = Depends(get_current_user),
):
    """List fraud violations. Admin sees all; athletes see their own."""
    user_data = require_role(user, ["admin", "athlete", "buyer"])
    role = user_data.get("role", "buyer") if user_data else "buyer"

    query = violations_ref
    if status:
        query = query.where("status", "==", status)

    docs = query.stream()
    violations = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id

        # Athletes only see violations related to their assets
        if role == "athlete":
            original_owner = data.get("original_asset", {}).get("owner_id", "")
            if original_owner != user["uid"]:
                continue

        violations.append(data)

    return {"success": True, "violations": violations}

@router.post("/dispute")
async def resolve_dispute(req: DisputeRequest, user: dict = Depends(get_current_user)):
    """Admin: approve or reject a violation dispute."""
    require_role(user, ["admin"])

    doc = violations_ref.document(req.violation_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Violation not found")

    violations_ref.document(req.violation_id).update({
        "status": req.resolution,
        "resolved_by": user["uid"],
        "resolution_notes": req.notes,
        "resolved_at": datetime.utcnow().isoformat(),
    })

    # If approved, freeze the asset
    if req.resolution == "approve":
        data = doc.to_dict()
        asset_id = data.get("suspected_asset", {}).get("asset_id", "")
        if asset_id:
            assets_ref.document(asset_id).update({
                "status": "frozen",
                "freeze_reason": "Fraud dispute approved",
                "updated_at": datetime.utcnow().isoformat(),
            })

    return {"success": True, "message": f"Dispute {req.resolution}"}
