import type { RaceResult } from '../../../../types/RaceResult'

const womenEditionId = 't100-singapore-2024-women'
const menEditionId = 't100-singapore-2024-men'
const r = (id:number,raceEditionId:string,gender:'W'|'M',athleteName:string,position:RaceResult['position'],swimTime?:string,t1Time?:string,bikeTime?:string,t2Time?:string,runTime?:string,totalTime?:string,seriesPoints?:number,ptoPoints?:number):RaceResult => ({id,raceEditionId,gender,athleteName,position,swimTime,t1Time,bikeTime,t2Time,runTime,totalTime,seriesPoints,ptoPoints})

export const singapore2024Results: RaceResult[] = [
  r(249101,womenEditionId,'W','Ashleigh Gentle',1,'27:41','1:18','2:05:26','00:50','1:09:10','3:44:23',35,100.90),
  r(249102,womenEditionId,'W','Lucy Charles-Barclay',2,'26:03','1:35','2:01:18','00:45','1:16:18','3:45:58',28,98.86),
  r(249103,womenEditionId,'W','Els Visser',3,'30:02','1:19','2:02:37','1:09','1:16:32','3:51:38',25,93.62),
  r(249104,womenEditionId,'W','Amelia Watkinson',4,'30:04','1:25','2:07:24','00:57','1:12:13','3:52:03',22,92.53),
  r(249105,womenEditionId,'W','Lucy Buckingham',5,'26:07','1:24','2:01:39','00:57','1:22:06','3:52:10',20,91.68),
  r(249106,womenEditionId,'W','Anne Reischmann',6,'31:59','1:18','2:02:42','00:49','1:16:53','3:53:39',18,89.78),
  r(249107,womenEditionId,'W','Lucy Byram',7,'28:21','1:27','2:04:55','00:46','1:18:42','3:54:08',16,88.67),
  r(249108,womenEditionId,'W','Haley Chura',8,'27:16','1:28','2:09:20','1:01','1:17:10','3:56:12',14,86.35),
  r(249109,womenEditionId,'W','Kaidi Kivioja',9,'30:05','1:20','2:06:53','00:48','1:17:49','3:56:54',12,85.10),
  r(249110,womenEditionId,'W','Ellie Salthouse',10,'28:06','1:24','2:09:04','00:55','1:20:54','4:00:21',11,81.71),
  r(249111,womenEditionId,'W','Radka Kahlefeldt',11,'28:34','1:20','2:13:32','1:17','1:17:44','4:02:25',10,79.42),
  r(249112,womenEditionId,'W','Lotte Wilms',12,'27:23','1:36','2:09:26','1:06','1:23:50','4:03:20',9,78.05),
  r(249113,womenEditionId,'W','Jocelyn McCauley',13,'27:47','1:46','2:09:41','1:14','1:23:25','4:03:51',8,77.00),
  r(249114,womenEditionId,'W','Pamella Oliveira',14,'28:32','1:37','2:14:19','00:51','1:18:52','4:04:10',7,76.12),
  r(249115,womenEditionId,'W','Anna Bergsten',15,'33:10','1:37','2:12:51','00:58','1:18:04','4:06:38',6,73.57),
  r(249116,womenEditionId,'W','Rebecca Clarke',16,'26:08','1:29','2:13:10','00:56','1:28:00','4:09:41',5,70.58),
  r(249117,womenEditionId,'W','Imogen Simmonds',17,'27:43','1:38','2:05:42','3:18','1:34:59','4:13:18',4,67.15),
  r(249118,womenEditionId,'W','India Lee','DNF','27:48','1:31','2:06:59','00:58'),
  r(249119,womenEditionId,'W','Chelsea Sodaro','DNF','30:02','1:26'),
  r(249120,womenEditionId,'W','Marjolaine Pierré','DNF','30:08','1:28'),

  r(249121,menEditionId,'M','Youri Keulen',1,'25:01','1:24','1:48:05','00:38','1:05:55','3:21:01',35,98.28),
  r(249122,menEditionId,'M','Sam Long',2,'28:32','1:20','1:48:01','00:35','1:04:12','3:22:38',28,96.05),
  r(249123,menEditionId,'M','Pieter Heemeryck',3,'25:24','1:17','1:49:05','00:50','1:06:55','3:23:30',25,94.50),
  r(249124,menEditionId,'M','David McNamee',4,'25:14','1:29','1:52:47','00:44','1:05:51','3:26:03',22,91.47),
  r(249125,menEditionId,'M','Kyle Smith',5,'24:38','1:22','1:49:38','00:37','1:10:44','3:26:57',20,89.92),
  r(249126,menEditionId,'M','Mika Noodt',6,'24:52','1:25','1:49:19','00:32','1:13:03','3:29:09',18,87.23),
  r(249127,menEditionId,'M','Aaron Royle',7,'24:34','1:25','1:50:37','00:42','1:12:06','3:29:22',16,86.32),
  r(249128,menEditionId,'M','Kacper Stepniak',8,'25:03','1:17','1:49:22','00:51','1:13:00','3:29:31',14,85.48),
  r(249129,menEditionId,'M','Frederic Funk',9,'25:38','1:37','1:51:15','00:53','1:12:26','3:31:48',12,82.76),
  r(249130,menEditionId,'M','Josh Amberger',10,'24:36','1:29','1:55:38','00:45','1:09:39','3:32:04',11,81.84),
  r(249131,menEditionId,'M','Rudy Von Berg',11,'25:28','1:23','1:52:34','00:44','1:13:06','3:33:13',10,80.16),
  r(249132,menEditionId,'M','Bradley Weiss',12,'25:31','1:43','1:56:24','00:53','1:11:14','3:35:44',9,77.28),
  r(249133,menEditionId,'M','Léon Chevalier',13,'27:42','1:22','1:57:04','00:57','1:08:55','3:35:57',8,76.45),
  r(249134,menEditionId,'M','Jason West',14,'24:47','1:20','1:52:31','00:38','1:18:30','3:37:43',7,74.25),
  r(249135,menEditionId,'M','Clement Mignon',15,'25:37','1:40','1:55:07','00:50','1:23:11','3:46:22',6,65.98),
  r(249136,menEditionId,'M','Alistair Brownlee','DNF','24:41','1:22','1:49:36','00:47'),
  r(249137,menEditionId,'M','Daniel Bækkegård','DNF','24:43','1:43','1:53:35','00:52'),
  r(249138,menEditionId,'M','Ben Kanute','DNF','24:43','1:24','1:58:25','00:46'),
  r(249139,menEditionId,'M','Sam Laidlow','DNF','24:49','1:26'),
]
