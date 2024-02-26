from ninja import Router, Schema
from django.http import JsonResponse
from django.contrib.auth import authenticate, login
from django.views.decorators.csrf import ensure_csrf_cookie
from django.contrib.auth.models import User
from ninja.errors import HttpError

router = Router()
_TGS = ['User API']

class UserOut(Schema):
    id: int
    email: str

class LoginIn(Schema):
    username: str
    password: str

@router.get("/me", tags=_TGS, response=UserOut)
def get_me(request):
    if request.user:
        return request.user
    else:
        raise HttpError(401, "Please login")

@router.post("/login", tags=_TGS, response=UserOut, auth=None)
def login_user(request, payload: LoginIn):
    user = User(**payload.dict())
    user = authenticate(request, username=user.username, password=user.password)
    if user is not None:
        login(request, user)
        print("login good")
        return user
    else:
        print("login bad")
        return JsonResponse({"error": "email or password is incorrect"})

@router.get('/set-cookie', tags=_TGS, auth=None)
@ensure_csrf_cookie
def login_set_cookie(request):
    """
    `login_view` requires that a csrf cookie be set.
    `getCsrfToken` in `auth.js` uses this cookie to
    make a request to `login_view`
    """
    return JsonResponse({"details": "CSRF cookie set"})