from django.urls import path

from . import views


urlpatterns = [
    path(
        'send/',
        views.SendNotificationView.as_view(),
        name='send_notification'
    ),
    path('<str:user_id>/', views.room, name='room'),
]
