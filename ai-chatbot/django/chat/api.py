import uuid
from datetime import datetime
from typing import List, Optional
from ninja import Router, Schema
from .models import Session, Message
import json
from openai import OpenAI
from .constants import OPENAI_KEY


# Set the openai key
client = OpenAI(
    # defaults to os.environ.get("OPENAI_API_KEY")
    api_key = OPENAI_KEY,
)

# API Router
router = Router()
_TGS = ['Chat API']

class MessageSchemaOut(Schema):
    id: uuid.UUID
    content: str
    role: str
    created_at: datetime
    session_id: uuid.UUID

class SessionSchemaIn(Schema):
    name: str
    user_id: int

class SessionSchemaOut(Schema):
    id: uuid.UUID
    name: str
    messages: List[MessageSchemaOut]

class ChatIn(Schema):
    session_id: uuid.UUID = None
    message: str

class ChatOut(Schema):
    message: str
    session_id: uuid.UUID
    error: Optional[str]

# Sessions CRUD
@router.get("/sessions", tags=_TGS, response=List[SessionSchemaOut])
def list_sessions(request):
    qs = Session.objects.filter(user=request.user).order_by('-created_at')
    return qs

@router.post("/sessions", tags=_TGS,response=SessionSchemaOut)
def create_session(request, payload: SessionSchemaIn):
    session = Session.objects.create(
        name=payload.name, 
        user=request.user
    )
    return session

@router.get("/sessions/{session_id}", tags=_TGS,response=SessionSchemaOut)
def get_session(request, session_id: uuid.UUID):
    session = get_object_or_404(Session, id=session_id)
    return session

@router.put("/sessions/{session_id}", tags=_TGS,response=SessionSchemaOut)
def update_session(request, session_id: uuid.UUID, payload: SessionSchemaIn):
    session = get_object_or_404(Session, id=session_id)
    for attr, value in payload.dict().items():
        setattr(session, attr, value)
    session.save()
    return session

@router.delete("/sessions/{session_id}", tags=_TGS)
def delete_session(request, session_id: uuid.UUID):
    session = get_object_or_404(Session, id=session_id)
    session.delete()
    return {"success": True}

# Chat API
@router.post("/chat", tags=_TGS, response=ChatOut)
def create_chat(request, payload: ChatIn):

    # get or create the session object
    session, created = Session.objects.get_or_create(
        id=payload.session_id,
        defaults={
            'name': f"{payload.message[:20]}...",
            "user": request.user
        }
    )

    # add the message to the session
    Message.objects.create(
        content=payload.message,
        role="user",
        session=session,
        user=request.user
    )

    # get our list of messages & create the right list object to send to OpenAI
    messages = Message.objects.filter(session=session).order_by('created_at')
    message_array = [{
        'role': 'system',
        'content': 'You are a helpful assistant.'
    }]
    for message in messages:
        message_dict = {
            'content': f"{message.content}",
            'role': message.role
        }
        message_array.append(message_dict)

    # send to OpenAI
    chat = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=message_array,
        temperature=0
    )

    # save the OpenAI response as a message
    Message.objects.create(
        content=chat['choices'][0]['message']['content'],
        role="assistant",
        session=session,
        user=request.user
    )

    return {
        "message": json.dumps(chat['choices'][0]['message']['content']),
        "role": "assistant",
        "session_id": session.id
    }