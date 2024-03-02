from django.contrib import admin
from .models import Session, Message

class SessionAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'created_at', 'updated_at', 'user']
    search_fields = ['name', 'user__username']
    readonly_fields = ['id', 'created_at', 'updated_at']

admin.site.register(Session, SessionAdmin)

class MessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'content', 'created_at', 'role', 'user', 'session']
    search_fields = ['content', 'role', 'user__username', 'session__name']
    readonly_fields = ['id', 'created_at']

admin.site.register(Message, MessageAdmin)