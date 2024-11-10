# LimeCal
A web application that helps users schedule meetings &amp; appoinments, similar to when2meet.

Here's a [demo video](https://youtu.be/rvjHqDUtujg) of the website.

Note: I've taken down the API and website due to server costs. However, this Git repo shows the application's source code and infrastructure back when it was active. Feel free to look around!

-----

## About the Source Code

The [frontend](frontend) was built using React in TypeScript. The [backend](scheduler) was built using Spring Boot in Java. For the database, PostgreSQL was used. You can find schemas for the database [here](scheduler/src/main/resources/schema.sql).

## Hosting

The application, while it was active, was hosted on an AWS EC2 instance. NGINX was used as the app's web server and reverse proxy. Elastic Load Balancer was used to manage TLS termination for HTTPS traffic.
