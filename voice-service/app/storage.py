from __future__ import annotations
from typing import Optional, Any, Dict
from datetime import datetime, timezone
from pymongo import MongoClient
from .security import phi_encrypt_json


class Storage:
    def __init__(self, mongo_url: Optional[str], db_name: str, fernet=None):
        self.mongo_url = mongo_url
        self.db_name = db_name
        self.fernet = fernet
        self._client: Optional[MongoClient] = None

    def _get_client(self) -> Optional[MongoClient]:
        if not self.mongo_url:
            return None
        if self._client is None:
            self._client = MongoClient(self.mongo_url)
        return self._client

    def store_prescription(self, *,
                           patient_id: Optional[str],
                           doctor_id: Optional[str],
                           result: Dict[str, Any],
                           meta: Optional[Dict[str, Any]] = None) -> Optional[str]:
        client = self._get_client()
        if client is None:
            return None
        db = client[self.db_name]
        col = db["prescriptions"]

        # Encrypt PHI payload
        enc_payload = phi_encrypt_json(result, self.fernet)

        doc = {
            "patientId": patient_id,
            "doctorId": doctor_id,
            "payload_enc": enc_payload,
            "phi_encrypted": enc_payload is not None,
            "createdAt": datetime.now(timezone.utc),
            "meta": {
                **(meta or {}),
                "overall_conf": result.get("confidence_overall"),
            },
        }
        res = col.insert_one(doc)
        return str(res.inserted_id)
