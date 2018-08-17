from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin

from .models import (
    Profile
)


class ProfileInline(admin.StackedInline):
    model = Profile
    fields = ['user', 'admin_image_thumb', 'profile_image', 'sex', 'slug', 'address_line1',
              'address_line2', 'city', 'state', 'postal', 'dob', 'phone', 'cell',
              'created_date', 'modified_date']
    readonly_fields = ['admin_image_thumb', 'created_date', 'modified_date']
    inline_classes = ['grp-open']


class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'email', 'first_name', 'last_name', 'is_staff', 'is_active']
    inlines = [ProfileInline] + UserAdmin.inlines


admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'slug']
    search_fields = ['user__username']
    fields = ['user', 'admin_image_thumb', 'profile_image', 'sex', 'slug', 'address_line1',
              'address_line2', 'city', 'state', 'postal', 'dob', 'phone', 'cell',
              'created_date', 'modified_date']
    readonly_fields = ['admin_image_thumb', 'created_date', 'modified_date']
