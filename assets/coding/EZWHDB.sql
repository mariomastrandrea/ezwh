--
-- File generated with SQLiteStudio v3.3.3 on Thu May 5 23:01:33 2022
--
-- Text encoding used: System
--
PRAGMA foreign_keys = off;
BEGIN TRANSACTION;

-- Table: TableResult
DROP TABLE IF EXISTS TableResult;
CREATE TABLE TableResult (ID INTEGER PRIMARY KEY, RFID VARCHAR (50), TestDescriptorId INTEGER, Date DATE, Result BOOLEAN);
INSERT INTO TableResult (ID, RFID, TestDescriptorId, Date, Result) VALUES (1, 'rfid2', 11, '04/05/2022', 'true');
INSERT INTO TableResult (ID, RFID, TestDescriptorId, Date, Result) VALUES (2, 'rfid1', 12, '03/05/2022', 'false');
INSERT INTO TableResult (ID, RFID, TestDescriptorId, Date, Result) VALUES (3, 'rfid2', 13, '04/05/2022', 'false');
INSERT INTO TableResult (ID, RFID, TestDescriptorId, Date, Result) VALUES (4, 'rfid1', 14, '05/05/2022', 'true');

-- Table: TestDescriptor
DROP TABLE IF EXISTS TestDescriptor;
CREATE TABLE TestDescriptor (ID INTEGER PRIMARY KEY, Name VARCHAR (50), ProcedureDescription VARCHAR (500), SkuId INTEGER);
INSERT INTO TestDescriptor (ID, Name, ProcedureDescription, SkuId) VALUES (11, 'test desc 1', 'this is desc 1', 1);
INSERT INTO TestDescriptor (ID, Name, ProcedureDescription, SkuId) VALUES (12, 'test desc 2', 'this is desc 2', 2);
INSERT INTO TestDescriptor (ID, Name, ProcedureDescription, SkuId) VALUES (13, 'test desc 3', 'this is desc 3', 3);
INSERT INTO TestDescriptor (ID, Name, ProcedureDescription, SkuId) VALUES (14, 'test desc 4', 'this is desc 4', 4);

-- Table: User
DROP TABLE IF EXISTS User;
CREATE TABLE User (ID INTEGER PRIMARY KEY, Name VARCHAR (50), Surname VARCHAR (50), Email VARCHAR (100), Type VARCHAR (50), Password VARCHAR (100));
INSERT INTO User (ID, Name, Surname, Email, Type, Password) VALUES (1, 'N1', 'S1', 'e1@gmail.com', 'CUSTOMER', 'pass1');
INSERT INTO User (ID, Name, Surname, Email, Type, Password) VALUES (2, 'N2', 'S2', 'e2@gmail.com', 'SUPPLIER', 'pass2');
INSERT INTO User (ID, Name, Surname, Email, Type, Password) VALUES (3, 'N3', 'S3', 'e3@gmail.com', 'MANAGER', 'pass3');
INSERT INTO User (ID, Name, Surname, Email, Type, Password) VALUES (4, 'N4', 'S4', 'e4@gmail.com', 'CLERK', 'pass4');

COMMIT TRANSACTION;
PRAGMA foreign_keys = on;
