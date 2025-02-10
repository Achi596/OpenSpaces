<h1 align="center">Open Spaces</h1>
<h3 align="center">COMP3900 Capstone Project by 3900f18bpookie</h3>

---

<p align="center">
<img alt="Logo Banner" width="200" height="200"  src="Frontend\src\assets\Logo.png"/>
<br/>
<br/>
<img alt="Version" src="https://img.shields.io/badge/any_text-3.0.0-pink?label=Version"/>
</a>
<img alt="Test Status" src="https://img.shields.io/badge/build-passing-brightgreen?label=Tests&labelColor=Green"/>
</a>
<img alt="Lint Status" src="https://img.shields.io/badge/build-passing-brightgreen?label=Lint&labelColor=Green"/>
</a>
<a href="https://hub.docker.com/repository/docker/achi596/openspaces-backend">
<img alt="Backend Docker Pull Count" src="https://img.shields.io/docker/pulls/achi596/openspaces-backend?label=Backend%20Docker%20Pull%20Count"/>
</a>
<a href="https://hub.docker.com/repository/docker/achi596/openspaces-frontend">
<img alt="Frontend Docker Pull Count" src="https://img.shields.io/docker/pulls/achi596/openspaces-frontend?label=Fontend%20Docker%20Pull%20Count"/>
</a>
</p>

---

Open Spaces is a booking platform for reserving meeting rooms and hotdesks in UNSW. It is powered by Nodejs and express
to provide staff and students with a sleek modern user expirience.

## Live Implementation

If you want to have a look around, a live demo of the web app is avaialable here: <https://openspaces.penguinserver.net/>

Admin Username: `john@unsw.edu.au`

Password: `12345`

Documentation of the backend API is also avaialable here: <https://api.openspaces.penguinserver.net/>

## Screenshots

### Welcome Screen
![image](https://cdn.openspaces.penguinserver.net/i/46b7060b-081e-494c-a32c-b0ad4de52f78.jpg)

### Dashboard
![image](https://cdn.openspaces.penguinserver.net/i/ab429845-8ee5-4d04-ae6d-fa7324c09cca.jpg)

### Interactive Floorplan Viewer
![image](https://cdn.openspaces.penguinserver.net/i/34276e3c-5d79-4e02-b3be-e202346fb003.jpg)

### Booking Page with Space Details
![image](https://cdn.openspaces.penguinserver.net/i/f69d03f3-0fae-4a3f-9594-7a809334d9aa.jpg)

### Intuitive Check-In Process
![image](https://cdn.openspaces.penguinserver.net/i/ea7d5763-c167-4e8c-84f3-af99060d3346.jpg)

## Running your own instance

To host the application yourself, here is an example docker-compose file

We recommend running the backend, frontend and CDN server behind a reverse proxy such as Nginx to improve security and prevent errors in the backend caused by CORS and CSRF tokens.

```yaml
version: '3.8'

# Volumes are created to ensure data persistance
volumes:
  system-Data:
  picsur-data:

services:
  open-spaces-SQL-DB:
    container_name: open-spaces-mariadb
    image: mariadb
    restart: always
    command: --transaction-isolation=READ-COMMITTED --innodb-file-per-table=1 # Configures the SQL DB to store each table seperately to improve manageability
    volumes:
      - system-Data:/var/lib/mysql
    ports:
      - 3306:3306 # Do not change the port!
    environment:
      - TZ=Australia/Sydney # Ensure timezone is correct to prevent SSL errors
      - MYSQL_ROOT_PASSWORD=m49C*CG^KMX%G* # If updated, make sure to update the backend variable as well
      - MYSQL_PASSWORD=NXA#Y22*XswTQh
      - MYSQL_DATABASE=SystemData # If updated, make sure to update the backend variable as well
      - MYSQL_USER=Aqua

  open-spaces-backend:
    image: achi596/openspaces-backend:latest
    container_name: open-spaces-backend
    depends_on:
      - open-spaces-SQL-DB # Ensures the SQL DB is running before starting the backend
    ports:
      - "3333:5000"  # If changed, make sure to update the backend port variable below as well!
    environment:
      - CDN_ADMIN_PASSWORD=WDFX3zJz91VAia # Should be same as the PICSUR_ADMIN_PASSWORD vairable set below
      - CDN_BASEURL=https://cdn.openspaces.penguinserver.net # Point to the PICSUR CDN server below
      - BACKEND_PORT=5000
      - BACKEND_JWT_SECRET=3900F18BPookie # Change to a more secure secret
      - BACKEND_GMAIL_USERNAME=comppookie@gmail.com # Replace with credentials for your own GMAIL account to send emails
      - BACKEND_GMAIL_PASSWORD=xuwy zgsx bdsl bldu # Replace with credentials for your own GMAIL account to send emails
      - SQL_HOST=10.16.0.5 # Replace with host for the above SQL server
      - SQL_USER=root
      - SQL_PASSWORD=m49C*CG^KMX%G*  # Should be the same as the MYSQL_ROOT_PASSWORD
      - SQL_DATABASE=SystemData # Should be the same as the MYSQL_DATABASE
    labels:
      - "com.centurylinklabs.watchtower.enable=true" # Enables management through watchtower to check for automatic updates

  open-spaces-frontend:
    image: achi596/openspaces-frontend:latest
    container_name: open-spaces-frontend
    depends_on:
      - open-spaces-backend # Ensures the backend is running before starting the frontend
    environment:
      - BACKEND_URL=https://backend.openspaces.penguinserver.net/ # Replace with host for the above backend
    ports:
      - "3334:80" # Only change the first part to set a diffrent port
    labels:
      - "com.centurylinklabs.watchtower.enable=true" # Enables management through watchtower to check for automatic updates

  open-spaces-watchtower:
    image: containrrr/watchtower
    container_name: open-spaces-watchtower
    restart: unless-stopped
    environment:
      - WATCHTOWER_POLL_INTERVAL=300 # Checks for updates to the web app every 5 Minutes
      - WATCHTOWER_CLEANUP=true # Removes old images to save space
      - WATCHTOWER_LABEL_ENABLE=true # Only manages containers with the correct lable
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    command: --include-stopped # Update containers even if they are stopped

  open-spaces-picsur:
    image: ghcr.io/caramelfur/picsur:latest
    container_name: open-spaces-picsur
    ports:
      - '3434:8080' # Only change the first part to set a diffrent port
    environment:
      # Do not change!
      - PICSUR_HOST=0.0.0.0
      - PICSUR_PORT=8080
      - PICSUR_DB_HOST=open-spaces-picsur_postgres
      - PICSUR_DB_PORT=5432

      # Should be same as the credentials for the postgres server below
      - PICSUR_DB_USERNAME=picsur 
      - PICSUR_DB_PASSWORD=gLTdHhMjodU0uw
      - PICSUR_DB_DATABASE=picsur
      
      # The default username is admin, this is not modifyable
      # Optional, random secret will be generated if not set
      - PICSUR_ADMIN_PASSWORD=WDFX3zJz91VAia 
      - PICSUR_JWT_SECRET=24Co*gV0PJIhw@
      - PICSUR_JWT_EXPIRY=7d

      # Maximum accepted size for uploads in bytes (128mb)
      - PICSUR_MAX_FILE_SIZE=128000000
    restart: unless-stopped

  open-spaces-picsur_postgres:
    image: postgres:14-alpine
    container_name: open-spaces-picsur_postgres
    environment:
      # Make sure these credentials are reflected above
      - POSTGRES_DB=picsur
      - POSTGRES_PASSWORD=gLTdHhMjodU0uw
      - POSTGRES_USER=picsur
    restart: unless-stopped
    volumes:
      - picsur-data:/var/lib/postgresql/data
```


## Running the development build

Here is the Docker compose used by us, that includes a few extra services that aided in developement and testing:

```yaml
version: '3.8'

# Volumes are created to ensure data persistance
volumes:
  system-Data:
  picsur-data:

services:
   # Swagger was used to document the backend routes for our frontend team
  open-spaces-swagger-ui:
    image: swaggerapi/swagger-ui
    container_name: open-spaces-swagger-ui
    ports:
      - "3307:8080"
    environment:
      SWAGGER_JSON: /swagger-api/swagger.yaml
    volumes:
      - swagger-api:/swagger-api

   # Swagger editor provided our team with a convenient method to edit the config file swagger 
  open-spaces-swagger-editor:
    image: swaggerapi/swagger-editor
    container_name: open-spaces-swagger-editor
    ports:
      - "3308:8080"
    volumes:
      - swagger-api:/swagger-api

   # Cloudbeaver was used to provide our team with a secure method of viewing and modifying the SQL server remotely without exposing it directly to the internet
  open-spaces-cloudbeaver:
    image: dbeaver/cloudbeaver:latest
    container_name: open-spaces-sql-viewer
    ports:
      - '8978:8978'
    environment:
      - CB_DB_DRIVER=mariadb
      - CB_DB_HOST=10.16.0.5
      - CB_DB_PORT=3306
      - CB_DB_USER=root
      - CB_DB_PASS=m49C*CG^KMX%G*

  open-spaces-SQL-DB:
    container_name: open-spaces-mariadb
    image: mariadb
    restart: always
    command: --transaction-isolation=READ-COMMITTED --innodb-file-per-table=1 # Configures the SQL DB to store each table seperately to improve manageability
    volumes:
      - system-Data:/var/lib/mysql
    ports:
      - 3306:3306 # Do not change the port!
    environment:
      - TZ=Australia/Sydney # Ensure timezone is correct to prevent SSL errors
      - MYSQL_ROOT_PASSWORD=m49C*CG^KMX%G* # If updated, make sure to update the backend variable as well
      - MYSQL_PASSWORD=NXA#Y22*XswTQh
      - MYSQL_DATABASE=SystemData # If updated, make sure to update the backend variable as well
      - MYSQL_USER=Aqua

  open-spaces-backend:
    image: achi596/openspaces-backend:latest
    container_name: open-spaces-backend
    depends_on:
      - open-spaces-SQL-DB # Ensures the SQL DB is running before starting the backend
    ports:
      - "3333:5000"  # If changed, make sure to update the backend port variable below as well!
    environment:
      - CDN_ADMIN_PASSWORD=WDFX3zJz91VAia # Should be same as the PICSUR_ADMIN_PASSWORD vairable set below
      - CDN_BASEURL=https://cdn.openspaces.penguinserver.net # Point to the PICSUR CDN server below
      - BACKEND_PORT=5000
      - BACKEND_JWT_SECRET=3900F18BPookie # Change to a more secure secret
      - BACKEND_GMAIL_USERNAME=comppookie@gmail.com # Replace with credentials for your own GMAIL account to send emails
      - BACKEND_GMAIL_PASSWORD=xuwy zgsx bdsl bldu # Replace with credentials for your own GMAIL account to send emails
      - SQL_HOST=10.16.0.5 # Replace with host for the above SQL server
      - SQL_USER=root
      - SQL_PASSWORD=m49C*CG^KMX%G*  # Should be the same as the MYSQL_ROOT_PASSWORD
      - SQL_DATABASE=SystemData # Should be the same as the MYSQL_DATABASE
    labels:
      - "com.centurylinklabs.watchtower.enable=true" # Enables management through watchtower to check for automatic updates

  open-spaces-frontend:
    image: achi596/openspaces-frontend:latest
    container_name: open-spaces-frontend
    depends_on:
      - open-spaces-backend # Ensures the backend is running before starting the frontend
    environment:
      - BACKEND_URL=https://backend.openspaces.penguinserver.net/ # Replace with host for the above backend
    ports:
      - "3334:80" # Only change the first part to set a diffrent port
    labels:
      - "com.centurylinklabs.watchtower.enable=true" # Enables management through watchtower to check for automatic updates

  open-spaces-watchtower:
    image: containrrr/watchtower
    container_name: open-spaces-watchtower
    restart: unless-stopped
    environment:
      - WATCHTOWER_POLL_INTERVAL=300 # Checks for updates to the web app every 5 Minutes
      - WATCHTOWER_CLEANUP=true # Removes old images to save space
      - WATCHTOWER_LABEL_ENABLE=true # Only manages containers with the correct lable
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    command: --include-stopped # Update containers even if they are stopped

  open-spaces-picsur:
    image: ghcr.io/caramelfur/picsur:latest
    container_name: open-spaces-picsur
    ports:
      - '3434:8080' # Only change the first part to set a diffrent port
    environment:
      # Do not change!
      - PICSUR_HOST=0.0.0.0
      - PICSUR_PORT=8080
      - PICSUR_DB_HOST=open-spaces-picsur_postgres
      - PICSUR_DB_PORT=5432

      # Should be same as the credentials for the postgres server below
      - PICSUR_DB_USERNAME=picsur 
      - PICSUR_DB_PASSWORD=gLTdHhMjodU0uw
      - PICSUR_DB_DATABASE=picsur
      
      # The default username is admin, this is not modifyable
      # Optional, random secret will be generated if not set
      - PICSUR_ADMIN_PASSWORD=WDFX3zJz91VAia 
      - PICSUR_JWT_SECRET=24Co*gV0PJIhw@
      - PICSUR_JWT_EXPIRY=7d

      # Maximum accepted size for uploads in bytes (128mb)
      - PICSUR_MAX_FILE_SIZE=128000000
    restart: unless-stopped

  open-spaces-picsur_postgres:
    image: postgres:14-alpine
    container_name: open-spaces-picsur_postgres
    environment:
      # Make sure these credentials are reflected above
      - POSTGRES_DB=picsur
      - POSTGRES_PASSWORD=gLTdHhMjodU0uw
      - POSTGRES_USER=picsur
    restart: unless-stopped
    volumes:
      - picsur-data:/var/lib/postgresql/data
```

## Known Issues

### Search bar does not work when not logged in!

A valid token is required by the backend to return the results for the search so no results are displayed when searching while being signed out.

As a temporary fix, please sign in before searching for a space.

### Some image uplaods are not correctly rendered by the server!

This issue is due to the file extension of teh image uploaded. Files with an uppercase extension name i.e (.JPG vs .jpg) will casuse an error which will prevent the images from being rendered correctly by the frontend.

For now please only upload images with a lowercase file extension name.

### Users are able to create duplicate accounts by using their firstname.lastname email address and their ZiD email address!

This issue is caused bythe backend treating the two ZiD's as two unique valid UNSW emaila addresses.

This bug will be addressed in a future update where SSO or ZiD only email address will be implemneted.


## FAQ

### Do I need to create the SQL tables manually?

No, the backend has a built in self-initialisation process which checks if the tables already exists and if not it will automatically create and configure them.

### Can I disable automatic updates?

Yes, automatic updates can be disabled either completely or on container by container basis.

Simply remove the watchtower label in the docker compose, from any containers you wish NOT to auto update.

### Can I block or suspend users who are abusing or exploiting the site?

By default, we already have measures in place that will automatically suspend users who abuse the booking system by creating fake bookings but never showing up.

However, If you want to suspend or terminate an accont manually you can though, by setting the account status field in the user table to `suspended` or `terminated` respectively.

## Credits ヾ(≧▽≦*)o

- Achintha Namaratne | z5413821 | z5413821@ad.unsw.edu.au
- Prathamesh Pawar | z5363908 | z5363908@ad.unsw.edu.au
- Sahil Gaikwad | z5363900 | z5363900@ad.unsw.edu.au
- Shivam Pasalkar | z5361951 | z5361951@ad.unsw.edu.au
- Jeremy Trinh | z5359974 | z5359974@ad.unsw.edu.au
- Jay Agarwal | z5341020 | z5341020@ad.unsw.edu.au
