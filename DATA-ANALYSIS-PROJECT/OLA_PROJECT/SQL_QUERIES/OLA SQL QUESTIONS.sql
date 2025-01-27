Create Database Ola;
Use Ola;
select * from bookings;
#1. Retrieve all successful bookings:
Create View Successfull_bookings as
select * from bookings 
where Booking_Status = 'Success';
select * from Successfull_bookings;
#2. Find the average ride distance for each vehicle type:
Create View average_ride_distance_for_each_vehicle as 
select Vehicle_Type, avg(Ride_Distance)
as avg_distance from bookings
group by Vehicle_Type;
select * from average_ride_distance_for_each_vehicle;
#3. Get the total number of cancelled rides by customers:
Create view cancelled_rides_by_customers as
SELECT COUNT(*) FROM bookings
WHERE Booking_Status = 'Canceled by Customer';
select * from cancelled_rides_by_customers;
#4. List the top 5 customers who booked the highest number of rides:
Create view top_five_customer as
SELECT Customer_ID, COUNT(Booking_ID) as total_rides FROM bookings GROUP BY
Customer_ID ORDER BY total_rides DESC LIMIT 5;
select * from top_five_customer;
#5. Get the number of rides cancelled by drivers due to personal and car-related issues:
create view cancelled_by_drivers_P_C_issue as
SELECT COUNT(*) FROM bookings 
WHERE Canceled_Rides_by_Driver = 'Personal & Car related issue';
select * from cancelled_by_drivers_P_C_issue;
#6. Find the maximum and minimum driver ratings for Prime Sedan bookings:
Create View Max_Min_Driver_Rating As
SELECT MAX(Driver_Ratings) as max_rating,
MIN(Driver_Ratings) as min_rating
FROM bookings WHERE Vehicle_Type = 'Prime Sedan';
select * from Max_Min_Driver_Rating;
#7. Retrieve all rides where payment was made using UPI:
Create View UPI_Payment As
SELECT * FROM bookings
WHERE Payment_Method = 'UPI';
select * from UPI_Payment;
#8. Find the average customer rating per vehicle type:
Create View AVG_Cust_Rating As
SELECT Vehicle_Type, AVG(Customer_Rating) as avg_customer_rating
FROM bookings
GROUP BY Vehicle_Type;
select * from AVG_Cust_Rating;
#9. Calculate the total booking value of rides completed successfully:
Create View total_successful_ride_value As
SELECT SUM(Booking_Value) as total_successful_ride_value
FROM bookings
WHERE Booking_Status = 'Success';
select * from total_successful_ride_value;
#10. List all incomplete rides along with the reason:
Create View Incomplete_Rides_Reason As
SELECT Booking_ID, Incomplete_Rides_Reason
FROM bookings
WHERE Incomplete_Rides = 'Yes';
select * from Incomplete_Rides_Reason
