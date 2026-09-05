import type { RaceResult } from '../../../../types/RaceResult'

const womenEditionId = 't100-london-2024-women'
const menEditionId = 't100-london-2024-men'
const r = (id:number,raceEditionId:string,gender:'W'|'M',athleteName:string,position:RaceResult['position'],swimTime?:string,t1Time?:string,bikeTime?:string,t2Time?:string,runTime?:string,totalTime?:string,seriesPoints?:number,ptoPoints?:number):RaceResult => ({id,raceEditionId,gender,athleteName,position,swimTime,t1Time,bikeTime,t2Time,runTime,totalTime,seriesPoints,ptoPoints})

export const london2024Results: RaceResult[] = [
  r(249301,womenEditionId,'W','Ashleigh Gentle',1,'26:26','1:14','2:01:46','00:52','1:06:02','3:36:17',35,100.99),
  r(249302,womenEditionId,'W','Imogen Simmonds',2,'26:24','1:22','1:59:44','00:47','1:10:55','3:39:11',28,97.81),
  r(249303,womenEditionId,'W','Kat Matthews',3,'27:28','1:19','2:01:39','00:49','1:08:16','3:39:29',25,96.78),
  r(249304,womenEditionId,'W','Laura Philipp',4,'27:35','1:19','2:01:30','00:57','1:08:43','3:40:02',22,95.56),
  r(249305,womenEditionId,'W','Lucy Byram',5,'27:32','1:16','2:00:07','00:46','1:10:47','3:40:26',20,94.48),
  r(249306,womenEditionId,'W','Tamara Jewett',6,'27:30','1:24','2:06:29','00:59','1:04:29','3:40:49',18,93.42),
  r(249307,womenEditionId,'W','Sophie Evans',7,'24:42','1:14','2:04:43','00:48','1:10:58','3:42:22',16,91.43),
  r(249308,womenEditionId,'W','Chelsea Sodaro',8,'27:27','1:23','2:06:31','00:58','1:06:39','3:42:55',14,90.27),
  r(249309,womenEditionId,'W','India Lee',9,'26:29','1:17','2:02:54','00:56','1:12:50','3:44:23',12,88.37),
  r(249310,womenEditionId,'W','Emma Pallant-Browne',10,'27:31','1:32','2:06:24','00:46','1:10:11','3:46:21',11,86.07),
  r(249311,womenEditionId,'W','Anne Haug',11,'27:29','1:19','2:06:35','00:51','1:10:27','3:46:39',10,85.16),
  r(249312,womenEditionId,'W','Lisa Norden',12,'27:31','1:22','2:03:04','00:51','1:14:39','3:47:26',9,83.86),
  r(249313,womenEditionId,'W','Anne Reischmann',13,'31:17','1:13','2:03:32','00:41','1:10:50','3:47:31',8,83.15),
  r(249314,womenEditionId,'W','Amelia Watkinson',14,'27:33','1:22','2:06:22','00:50','1:13:36','3:49:41',7,80.74),
  r(249315,womenEditionId,'W','Haley Chura',15,'25:35','1:29','2:13:08','00:56','1:09:22','3:50:28',6,79.48),
  r(249316,womenEditionId,'W','Grace Thek',16,'27:09','1:29','2:09:36','00:54','1:12:11','3:51:16',5,78.23),
  r(249317,womenEditionId,'W','Laura Madsen',17,'27:32','1:28','2:09:31','00:56','1:12:39','3:52:05',4,76.96),
  r(249318,womenEditionId,'W','Kaidi Kivioja',18,'28:05','1:17','2:09:52','00:50','1:16:56','3:56:58',3,72.37),
  r(249319,womenEditionId,'W','Marjolaine Pierré',19,'27:26','1:28','2:10:28','00:55','1:18:31','3:58:45',2,70.34),
  r(249320,womenEditionId,'W','Lucy Charles-Barclay','DNF','24:40','1:19','2:01:54','00:49'),

  r(249321,menEditionId,'M','Sam Laidlow',1,'24:06','1:10','1:46:42','00:40','1:01:01','3:13:38',35,100.02),
  r(249322,menEditionId,'M','Kyle Smith',2,'23:05','1:06','1:49:20','00:41','59:53','3:14:03',28,98.83),
  r(249323,menEditionId,'M','Daniel Bækkegård',3,'23:08','1:17','1:49:28','00:44','1:02:06','3:16:41',25,95.63),
  r(249324,menEditionId,'M','Magnus Ditlev',4,'23:16','1:17','1:49:06','00:43','1:03:21','3:17:41',22,93.95),
  r(249325,menEditionId,'M','Frederic Funk',5,'23:31','1:15','1:48:42','00:49','1:03:38','3:17:53',20,93.01),
  r(249326,menEditionId,'M','Pieter Heemeryck',6,'23:26','1:11','1:51:47','1:01','1:01:48','3:19:09',18,91.11),
  r(249327,menEditionId,'M','Rico Bogen',7,'23:03','1:11','1:49:16','00:42','1:05:56','3:20:05',16,89.53),
  r(249328,menEditionId,'M','Alistair Brownlee',8,'23:00','1:09','1:52:43','00:39','1:02:58','3:20:27',14,88.48),
  r(249329,menEditionId,'M','Youri Keulen',9,'23:30','1:08','1:49:04','00:42','1:06:20','3:20:43',12,87.54),
  r(249330,menEditionId,'M','Gregory Barnaby',10,'23:12','1:10','1:49:27','00:46','1:06:32','3:21:05',11,86.52),
  r(249331,menEditionId,'M','Sam Long',11,'26:34','1:07','1:54:38','00:45','1:00:24','3:23:25',10,83.71),
  r(249332,menEditionId,'M','Léon Chevalier',12,'24:55','1:12','1:53:42','00:50','1:02:52','3:23:30',9,82.98),
  r(249333,menEditionId,'M','David McNamee',13,'23:20','1:12','1:54:55','00:49','1:03:17','3:23:31',8,82.33),
  r(249334,menEditionId,'M','Jason West',14,'23:28','1:12','2:01:00','00:41','59:37','3:25:57',7,79.47),
  r(249335,menEditionId,'M','Aaron Royle',15,'22:57','1:16','1:55:17','00:53','1:07:20','3:27:41',6,77.26),
  r(249336,menEditionId,'M','Rudy Von Berg',16,'23:33','1:15','1:56:08','00:44','1:07:32','3:29:10',5,75.29),
  r(249337,menEditionId,'M','Jan Stratmann',17,'23:14','1:14','1:54:22','00:49','1:11:01','3:30:38',4,73.36),
  r(249338,menEditionId,'M','Clement Mignon',18,'24:04','1:16','1:54:15','00:48','1:12:15','3:32:37',3,70.95),
  r(249339,menEditionId,'M','Max Neumann',19,'23:18','1:09','1:49:32','00:51','1:17:57','3:32:45',2,70.26),
  r(249340,menEditionId,'M','Ben Kanute','DNF','23:11','1:12'),
]
