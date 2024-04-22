from django.contrib.auth.decorators import login_required
from django.shortcuts import render


def room(request, user_id):
    return render(request, 'notifications/room.html', {
        'room_name': user_id,
    })
