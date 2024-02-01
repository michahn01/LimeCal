# LimeCal
A web application that helps users schedule meetings &amp; appoinments, similar to when2meet. 

Check out the website [here](https://limecal.com/events/create)!

-----

## About the Source Code

The [frontend](frontend) was built using React in TypeScript. The [backend](scheduler) was built using Spring Boot in Java. For the database, PostgreSQL was used. You can find schemas for the database [here](scheduler/src/main/resources/schema.sql).

## Hosting

The application is hosted on an AWS EC2 instance. NGINX is used as the app's web server and reverse proxy. Though this application doesn't load balance, AWS Elastic Load Balancer is used to manage TLS termination for HTTPS traffic.
