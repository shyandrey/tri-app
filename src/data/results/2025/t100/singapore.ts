import type { RaceResult } from '../../../../types/RaceResult'

const womenEditionId = 'singapore-t100-2025-women'
const menEditionId = 'singapore-t100-2025-men'

const r = (id:number,raceEditionId:string,gender:'W'|'M',athleteName:string,position:RaceResult['position'],swimTime?:string,t1Time?:string,bikeTime?:string,t2Time?:string,runTime?:string,totalTime?:string,seriesPoints?:number,ptoPoints?:number,athleteId?:number):RaceResult => ({id,raceEditionId,gender,athleteName,position,swimTime,t1Time,bikeTime,t2Time,runTime,totalTime,seriesPoints,ptoPoints,athleteId})

export const singapore2025Results: RaceResult[] = [
  r(250401,womenEditionId,'W','Kate Waugh',1,'26:29','1:44','2:05:35','00:54','1:10:37','3:45:18',35,102.57),
  r(250402,womenEditionId,'W','Lisa Perterer',2,'29:19','1:34','2:06:20','1:06','1:13:41','3:51:58',29,96.57),
  r(250403,womenEditionId,'W','Lucy Charles-Barclay',3,'26:25','1:46','2:09:17','1:14','1:14:29','3:53:09',26,94.87),
  r(250404,womenEditionId,'W','Hannah Berry',4,'27:51','1:46','2:08:54','00:59','1:14:07','3:53:35',23,93.76),
  r(250405,womenEditionId,'W','Taylor Spivey',5,'26:32','2:01','2:14:28','00:50','1:10:51','3:54:39',20,92.18),
  r(250406,womenEditionId,'W','Ashleigh Gentle',6,'27:18','1:42','2:11:34','1:00','1:13:40','3:55:12',18,91.01),
  r(250407,womenEditionId,'W','Grace Thek',7,'28:48','1:54','2:11:13','1:14','1:13:35','3:56:42',16,89.11),
  r(250408,womenEditionId,'W','Amelia Watkinson',8,'29:23','1:47','2:09:39','00:54','1:15:42','3:57:22',14,87.89),
  r(250409,womenEditionId,'W','Marlene De Boer',9,'29:26','1:46','2:10:50','1:17','1:15:12','3:58:28',12,86.34),
  r(250410,womenEditionId,'W','Megan McDonald',10,'29:22','1:55','2:11:13','1:23','1:20:30','4:04:19',11,81.10),
  r(250411,womenEditionId,'W','Marta Sánchez',11,'28:46','1:42','2:16:33','1:21','1:16:26','4:04:46',10,80.08),
  r(250412,womenEditionId,'W','Julie Derron',12,'26:26','1:28','2:20:36','00:50','1:16:33','4:05:52',9,78.57),
  r(250413,womenEditionId,'W','Jessica Learmonth',13,'26:23','1:39','2:05:29','1:17','1:37:06','4:11:51',8,73.27),
  r(250414,womenEditionId,'W','Els Visser',14,'31:41','1:44','2:19:31','1:11','1:18:11','4:12:16',7,72.31),
  r(250415,womenEditionId,'W','Cecilia Perez',15,'28:43','1:42','2:22:37','1:17','1:18:31','4:12:48',6,71.28),
  r(250416,womenEditionId,'W','Flora Duffy','DNF','26:46','1:50'), r(250417,womenEditionId,'W','India Lee','DNF','27:21','1:44'), r(250418,womenEditionId,'W','Lucy Byram','DNF','29:22','1:31'), r(250419,womenEditionId,'W','Minttu Hukka','DNF','35:37','2:16'),
  r(250420,menEditionId,'M','Hayden Wilde',1,'24:33','1:22','1:49:42','00:50','1:01:46','3:18:11',35,100.85,3),
  r(250421,menEditionId,'M','Léo Bergere',2,'23:59','1:34','1:52:23','00:42','1:02:09','3:20:45',29,97.75),
  r(250422,menEditionId,'M','Marten Van Riel',3,'23:47','1:32','1:52:36','1:02','1:02:38','3:21:33',26,96.25,2),
  r(250423,menEditionId,'M','Youri Keulen',4,'24:31','1:32','1:53:29','00:48','1:01:48','3:22:05',23,95.00),
  r(250424,menEditionId,'M','Gregory Barnaby',5,'24:35','1:32','1:51:44','00:52','1:03:49','3:22:30',20,93.88),
  r(250425,menEditionId,'M','Mathis Margirier',6,'24:33','1:33','1:50:22','00:56','1:05:35','3:22:58',18,92.72),
  r(250426,menEditionId,'M','Antonio Benito López',7,'24:30','1:28','1:53:46','00:57','1:03:56','3:24:34',16,90.56),
  r(250427,menEditionId,'M','Sam Long',8,'29:19','1:32','1:51:28','00:46','1:01:55','3:24:59',14,89.48),
  r(250428,menEditionId,'M','Mika Noodt',9,'24:29','1:33','1:51:04','1:04','1:07:10','3:25:18',12,88.50),
  r(250429,menEditionId,'M','Rico Bogen',10,'24:27','1:26','1:49:40','00:54','1:09:10','3:25:34',11,87.58),
  r(250430,menEditionId,'M','Menno Koolhaas',11,'23:50','1:36','1:55:07','00:59','1:04:26','3:25:56',10,86.59),
  r(250431,menEditionId,'M','Justus Nieschlag',12,'24:26','1:34','1:54:08','00:48','1:08:58','3:29:51',9,82.43),
  r(250432,menEditionId,'M','Max Stapley',13,'23:44','1:33','1:55:44','1:03','1:10:38','3:32:40',8,79.27),
  r(250433,menEditionId,'M','Vincent Luis',14,'23:43','1:29','2:03:03','1:09','1:03:52','3:33:14',7,78.13),
  r(250434,menEditionId,'M','Jannik Schaufler',15,'24:29','1:26','2:00:47','00:50','1:10:35','3:38:05',6,73.17),
  r(250435,menEditionId,'M','Frederic Funk',16,'25:03','1:56','1:59:09','00:49','1:18:26','3:45:21',5,66.06),
  r(250436,menEditionId,'M','Tyler Mislawchuk',17,'24:02','1:28','2:05:09','00:58','1:20:03','3:51:39',4,59.83),
  r(250437,menEditionId,'M','Jelle Geens','DNF','24:32','1:25','1:53:13','00:49'), r(250438,menEditionId,'M','Nicolas Mann','DNF','27:16','1:31'),
]
