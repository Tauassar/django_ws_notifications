from django.urls import path

from . import views


urlpatterns = [
    path('', views.room, name='room'),
    path(
        'send/',
        views.SendNotificationView.as_view(),
        name='send_notification',
    ),
]
