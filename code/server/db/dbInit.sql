DELETE FROM InternalOrder;

DELETE FROM InternalOrderSku;

DELETE FROM InternalOrderSkuItem;

DELETE FROM Item;

DELETE FROM Position;

DELETE FROM RestockOrder;

DELETE FROM RestockOrderSku;

DELETE FROM RestockOrderSkuItem;

DELETE FROM ReturnOrder;

DELETE FROM ReturnOrderSkuItem;

DELETE FROM Sku;

DELETE FROM SkuItem;

DELETE FROM TestDescriptor;

DELETE FROM TestResult;

DELETE FROM User;

INSERT INTO InternalOrder (CustomerId, State, IssueDate, ID)
VALUES (1, 'COMPLETED', '2021/11/29 09:33', 1);

INSERT INTO InternalOrderSku (Quantity, Price, Description, SkuId, InternalOrderId) 
VALUES (20, 10.99, 'another sku', 5, 1);

INSERT INTO InternalOrderSkuItem (RFID, SkuId, InternalOrderId) 
VALUES ('12345678901234567890123456789015', 5, 1);

INSERT INTO Item (SupplierId, SkuId, Price, Description, ID)
VALUES (1, 1, 10.99, 'a new item', 1),      (2, 5, 11.99, 'another item', 2);

INSERT INTO Position (OccupiedVolume, OccupiedWeight, MaxVolume, MaxWeight, Col, [Row], Aisle, ID) 
VALUES (0, 0, 1000, 1000, 3415, 3452, 8002, 800234523415), 
       (100, 200, 1000, 1000, 3417, 3452, 8002, 800234523417), 
       (5, 10, 1000, 1000, 3410, 3452, 8002, 800234523410), 
       (0, 0, 600, 1200, 3414, 3452, 8002, 800234523414), 
       (0, 0, 1000, 2000, 3413, 3452, 8002, 800234523413);

INSERT INTO RestockOrder (TransportNote, SupplierId, State, IssueDate, ID) 
VALUES ('delivered on 2021/12/05', 1, 'DELIVERED', '2021/11/29 09:33', 1), 
       (NULL, 2, 'ISSUED', '2021/11/29 09:33', 8);

INSERT INTO RestockOrderSku (Quantity, Price, Description, SkuId, RestockOrderId) 
VALUES (20, 10.99, 'a sku', 1, 1), 
       (30, 10.99, 'a product', 12, 8), 
       (20, 11.99, 'another product', 180, 8);

INSERT INTO RestockOrderSkuItem (RFID, SkuId, RestockOrderId) 
VALUES ('12345678901234567890123456789011', 1, 1);

INSERT INTO ReturnOrder (RestockOrderId, ReturnDate, ID) 
VALUES (1, '2021/11/29', 1);

INSERT INTO ReturnOrderSkuItem (RFID, Price, Description, SkuId, ReturnOrderId) 
VALUES ('12345678901234567890123456789011',10.99,'a sku',1,1),
       ('12345678901234567890123456789012',11,'a sku',1,1);

INSERT INTO Sku (Price,AvailableQuantity,Position,Notes,Volume,Weight,Description,ID)
VALUES (10.99,2,800234523417,'first sku',50,100,'a sku',1),
       (10.99,0,800234523415,'third sku',60,101,'another sku',3),
       (10.99,1,800234523413,'second sku',5,10,'another sku',5);

INSERT INTO SkuItem (DateOfStock, Available, SkuId, RFID)
VALUES ('2021/11/29', 1, 1, '12345678901234567890123456789011'),
       ('2021/11/29', 1, 1, '12345678901234567890123456789015');

INSERT INTO TestDescriptor (SkuId,ProcedureDescription,Name,ID) 
VALUES (1,'This test is described by...','test desc 1',1),
       (5,'This test is described by...','test desc 2',2),
       (5,'This test is described by...','test desc 3',3);
 

INSERT INTO TestResult (Result,Date,TestDescriptorId,RFID,ID)
VALUES (1,'2021/11/28',1,'12345678901234567890123456789011',1),
       (0,'03/05/2022',2,'12345678901234567890123456789015',2),
       (1,'05/05/2022',3,'12345678901234567890123456789015',3);


INSERT INTO User (Password, Type, Email, Surname, Name, ID)
VALUES ('$2b$10$DpP7/.UA1BBIJh1HLIzfEuL9i76YtSNRFqxI2jOSzdd7JZjeooBqK', 'supplier', 'e1@gmail.com', 'S1', 'N1', 1),
       ('$2b$10$scv95TLAb32Q48PEazMzm.D4F7tPskbFuoYQKBDHDdYLvqsIflaw6', 'supplier', 'e2@gmail.com', 'S4', 'N4', 2),
       ('$2b$10$DpP7/.UA1BBIJh1HLIzfEuL9i76YtSNRFqxI2jOSzdd7JZjeooBqK', 'manager', 'e3@gmail.com', 'S3', 'N3', 3),
       ('$2b$10$do5Y76EDsWuJGhX71mT/QO5kcSKxLyLZUInZObN9lWhIDm6Ybk/xa', 'customer', 'e5@gmail.com', 'S5', 'N5', 5),
       ('$2b$10$lXCmmtWjPWUZNOeuDKN4tuCoY2SNyM7pS48CJjZMSPi.oksxH3PhG', 'clerk', 'e6@gmail.com', 'S6', 'N6', 6),
       ('$2b$10$DpJJBjSIhHrUIeqN6DGjQO6HElIWkW0EUv0M/.eDXehvsnoUH4AWW', 'customer', 'user1@ezwh.com', 'ezwh', 'user1', 10),
       ('$2b$10$8ifkqdltPnGcmtM1L78.u.d0dadJOfC8Gzo9xO96zo7y09KO7LTM6', 'qualityEmployee', 'qualityEmployee1@ezwh.com', 'ezwh', 'qualityEmployee1', 11),
       ('$2b$10$Ck3wFm8A1OuRZoWYmUoFd.dbIfzBajcwyPQoeEvRyPY3jboCClbGi', 'clerk', 'clerk1@ezwh.com', 'ezwh', 'clerk1', 12),
       ('$2b$10$ltVGctpeT1WmH2eDNS4.yeLXYywbOO9RFtiUQyCP8KqXSwwd5MzU.', 'deliveryEmployee', 'deliveryEmployee1@ezwh.com', 'ezwh', 'deliveryEmployee1', 13),
       ('$2b$10$BuNuZgCIaTdEqK6.5vDVx.TF97zrcyDcRxaEt7BLNEZ9Kze/BlS1y', 'supplier', 'supplier1@ezwh.com', 'ezwh', 'supplier1', 14),
       ('$2b$10$w6ssb3.pV/HiWEHYr9btM.IA5J..eaHP3JEFBRy2AeCsyUz9N1hp.', 'manager', 'manager1@ezwh.com', 'ezwh', 'manager1', 16);

--hardcoded users
INSERT INTO User (Password,Type,Email,Surname,Name,ID)
VALUES ('$2b$10$1Aj6mgLmWO8bdNMRPJLmXujV8PbSqw2xE53QfEB9/w/twxHOSypFy','customer','user1@ezwh.com','Smith','John',95),
       ('$2b$10$1Aj6mgLmWO8bdNMRPJLmXujV8PbSqw2xE53QfEB9/w/twxHOSypFy','qualityEmployee','qualityEmployee1@ezwh.com','Smith','John',96),
       ('$2b$10$1Aj6mgLmWO8bdNMRPJLmXujV8PbSqw2xE53QfEB9/w/twxHOSypFy','clerk','clerk1@ezwh.com','Smith','John',97),
       ('$2b$10$1Aj6mgLmWO8bdNMRPJLmXujV8PbSqw2xE53QfEB9/w/twxHOSypFy','deliveryEmployee','deliveryEmployee1@ezwh.com','Smith','John',98),
       ('$2b$10$1Aj6mgLmWO8bdNMRPJLmXujV8PbSqw2xE53QfEB9/w/twxHOSypFy','supplier','supplier1@ezwh.com','Smith','John',99),
       ('$2b$10$1Aj6mgLmWO8bdNMRPJLmXujV8PbSqw2xE53QfEB9/w/twxHOSypFy','manager','manager1@ezwh.com','Smith','John',100);