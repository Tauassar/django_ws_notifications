# Django and WebSocket based real-time notifications service

<!-- GETTING STARTED -->
## Getting Started

This is an example of how you may give instructions on setting up your project locally.
To get a local copy up and running follow these simple example steps.

### Prerequisites

To run this project you need to have docker and docker-compose installed on your computer.

### Installation

1. Clone the repo
   ```sh
   git clone git@github.com:Tauassar/django_ws_notifications.git
   ```
2. Add .env file to root folder, file should consist of at least the following variables
   ```dotenv
   POSTGRES_HOST=postgres
   POSTGRES_PORT=5432
   POSTGRES_DB=test
   POSTGRES_USER=test
   POSTGRES_PASSWORD=test
   ```
2. Run docker-compose
   ```sh
   docker-compose up --build
   ```
3. To stop containers 
   ```sh
   docker-compose down
   ```
3. To stop containers and remove related data 
   ```sh
   docker-compose down -v --remove-orphans
   ```
<br/>

### Adding superuser to django application

To add superuser we need to connect to container with django application, web_app in this case, and run appropriate command.

1. Enter the docker shell using
```sh
docker-compose exec backend /entrypoint bash
```

2. Run django manage.py command to initiate creation of superuser
```sh
./manage.py createsuperuser
```
After you need to fill requested information in interactive terminal window. 


### Entering demo page

To enter demo page:

1. Start docker container using docker compose command
2. Create user (can be created using superuser command)
3. Follow the link http://localhost:8002/api/notifications/
4. Log in Login Form section using username and password provided during user registration, to obtain auth token

Now you can consume server sent notifications from web browser

![img.png](docs/img_0.png)

### To send notifications from server side there are several options

#### Option 1: send notification from server's console

this way demonstrated how to send notifications withing the code itself

1. Enter the docker shell using
```sh
docker-compose exec backend /entrypoint bash
```

2. Enter the django shell using
```sh
./manage.py shell_plus
```

3. Call command to send notification message, where {user_id} is an ID of a newly created user (for a fresh installation, user ID is 1) and test_message is message to be sent to consumer
```python
import datetime
from apps.notifications.services import notify_user_by_id
test_message = {
     "test": f"hello, this is a test message, timestamp: {datetime.datetime.now().isoformat()}"
}
user_id = "1"
notify_user_by_id(user_id, test_message)
```
   
Now you can check if message consumed by your browser
<br/>

#### Option 2: send notification using HTTP API

this way demonstrated how to integrate/send notifications using http API.

The HTTP API documentation itself documented using swagger on http://localhost:8082/api/docs

1. To send http request either enter swagger page or use CURL command
```bash
curl -X 'POST' \
  'http://localhost:8002/api/notifications/send/' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "user_id": 1,
  "payload": {
    "additionalProp1": "string",
    "additionalProp2": "string",
    "additionalProp3": "string"
  }
}'
```
where user_id is an ID of a newly created user (for a fresh installation, user ID is 1) and payload is an arbitary payload sent to user over WS channel
<br/>

#### Option 2: send notification using RabbitMQ
this way demonstrated how to integrate/send notifications using RabbitMQ.

1. By default docker-compose includes rabbitmq management plugin, therefore you can enter http://localhost:15672 page to login to rabbitmq management console (default credentials are guest/guest).
2. After enter `Exchanges` pannel and choose `notifications_exchange`
![img.png](docs/img_1.png)
3. Open the `Publish message` dropdown and paste following values

Routing key `notifications.send`

Payload:
```json
{
  "user_id": 1,
  "payload": {
    "additionalProp1": "string",
    "additionalProp2": "string",
    "additionalProp3": "string"
  }
}
```
where user_id is an ID of a newly created user (for a fresh installation, user ID is 1)
and payload is an arbitary payload sent to user over WS channel

![img.png](docs/img_2.png)

4. Press publish message button,
   that way message is published to `notifications_exchange` and after consumed by `rabbitmq_consumer`,
   which publishes message further to WS channel
<br/>


## Architecture
![img.png](docs/img_3.png)

## Algorithm
![ws_algorithm.jpg](docs%2Fws_algorithm.jpg)
