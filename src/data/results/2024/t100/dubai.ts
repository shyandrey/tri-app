import type { RaceResult } from '../../../../types/RaceResult'

const womenEditionId = 't100-dubai-2024-women'
const menEditionId = 't100-dubai-2024-men'
const r = (id:number,raceEditionId:string,gender:'W'|'M',athleteName:string,position:RaceResult['position'],swimTime?:string,t1Time?:string,bikeTime?:string,t2Time?:string,runTime?:string,totalTime?:string,seriesPoints?:number,ptoPoints?:number):RaceResult => ({id,raceEditionId,gender,athleteName,position,swimTime,t1Time,bikeTime,t2Time,runTime,totalTime,seriesPoints,ptoPoints})

export const dubai2024Results: RaceResult[] = [
  r(249601,womenEditionId,'W','Taylor Knibb',1,'26:36','1:21','1:54:18','00:39','1:06:26','3:29:17',55,101.56),
  r(249602,womenEditionId,'W','Julie Derron',2,'26:37','00:57','1:57:29','00:33','1:05:35','3:31:08',45,99.19),
  r(249603,womenEditionId,'W','Ashleigh Gentle',3,'26:43','1:03','1:57:15','00:44','1:06:00','3:31:42',40,97.93),
  r(249604,womenEditionId,'W','Flora Duffy',4,'26:39','1:10','2:01:03','00:42','1:03:32','3:33:05',35,95.98),
  r(249605,womenEditionId,'W','Kat Matthews',5,'29:18','1:21','1:57:23','00:51','1:05:28','3:34:18',30,94.20),
  r(249606,womenEditionId,'W','Lucy Byram',6,'29:12','1:02','1:56:14','00:43','1:07:47','3:34:56',27,92.92),
  r(249607,womenEditionId,'W','Laura Philipp',7,'29:43','1:17','1:57:04','00:42','1:07:17','3:36:01',24,91.27),
  r(249608,womenEditionId,'W','Taylor Spivey',8,'26:34','1:09','2:03:15','00:33','1:04:56','3:36:23',21,90.26),
  r(249609,womenEditionId,'W','Imogen Simmonds',9,'26:42','1:13','1:57:13','00:41','1:10:55','3:36:41',18,89.31),
  r(249610,womenEditionId,'W','Anne Haug',10,'29:16','1:18','2:00:27','00:53','1:05:36','3:37:29',16,87.95),
  r(249611,womenEditionId,'W','Paula Findlay',11,'28:13','1:07','1:57:55','00:54','1:10:36','3:38:42',14,86.25),
  r(249612,womenEditionId,'W','India Lee',12,'26:50','1:09','1:58:21','00:53','1:13:22','3:40:34',12,84.01),
  r(249613,womenEditionId,'W','Kaidi Kivioja',13,'29:16','1:05','1:59:12','00:50','1:11:33','3:41:55',11,82.22),
  r(249614,womenEditionId,'W','Laura Madsen',14,'29:17','1:02','2:00:47','00:50','1:10:10','3:42:05',10,81.45),
  r(249615,womenEditionId,'W','Marlene De Boer',15,'29:40','1:15','2:02:39','1:04','1:08:57','3:43:33',9,79.59),
  r(249616,womenEditionId,'W','Sara Pérez Sala',16,'26:31','00:54','2:02:35','1:09','1:12:46','3:43:53',8,78.71),
  r(249617,womenEditionId,'W','Kate Curran',17,'28:11','1:21','2:07:08','00:55','1:08:38','3:46:11',7,76.16),
  r(249618,womenEditionId,'W','Marjolaine Pierré',18,'28:14','1:17','2:03:28','00:49','1:15:25','3:49:11',6,73.03),
  r(249619,womenEditionId,'W','Diede Diederiks',19,'33:24','1:06','2:03:23','1:01','1:13:33','3:52:25',5,69.72),
  r(249620,womenEditionId,'W','Tamara Jewett','DNF','30:00','1:19'),

  r(249621,menEditionId,'M','Marten Van Riel',1,'24:40','1:16','1:44:27','00:31','58:26','3:09:17',55,99.60),
  r(249622,menEditionId,'M','Rico Bogen',2,'24:37','1:16','1:44:20','00:43','58:45','3:09:39',45,98.46),
  r(249623,menEditionId,'M','Alistair Brownlee',3,'24:39','1:05','1:44:34','00:51','59:18','3:10:25',40,96.95),
  r(249624,menEditionId,'M','Kyle Smith',4,'24:46','1:01','1:44:40','00:38','59:38','3:10:41',35,95.93),
  r(249625,menEditionId,'M','Mathis Margirier',5,'24:40','1:03','1:44:37','00:45','1:00:40','3:11:44',30,94.18),
  r(249626,menEditionId,'M','Justus Nieschlag',6,'24:42','1:02','1:46:37','00:38','59:34','3:12:31',27,92.70),
  r(249627,menEditionId,'M','Frederic Funk',7,'24:43','1:14','1:44:19','00:47','1:01:48','3:12:49',24,91.69),
  r(249628,menEditionId,'M','Magnus Ditlev',8,'25:52','1:11','1:44:59','00:49','1:00:41','3:13:29',21,90.35),
  r(249629,menEditionId,'M','Pieter Heemeryck',9,'24:49','1:12','1:46:16','00:54','1:00:41','3:13:50',18,89.33),
  r(249630,menEditionId,'M','Sam Long',10,'28:53','1:05','1:45:36','00:35','59:05','3:15:12',16,87.35),
  r(249631,menEditionId,'M','Youri Keulen',11,'24:40','1:07','1:48:33','00:51','1:00:33','3:15:42',14,86.22),
  r(249632,menEditionId,'M','David McNamee',12,'24:54','1:06','1:49:10','00:48','1:00:51','3:16:48',12,84.52),
  r(249633,menEditionId,'M','Jason West',13,'24:45','1:02','1:50:47','00:38','59:54','3:17:04',11,83.63),
  r(249634,menEditionId,'M','Aaron Royle',14,'24:36','1:14','1:47:00','00:46','1:04:04','3:17:38',10,82.47),
  r(249635,menEditionId,'M','Rudy Von Berg',15,'25:22','1:11','1:50:03','00:46','1:05:54','3:23:15',9,76.54),
  r(249636,menEditionId,'M','Léon Chevalier',16,'27:52','1:38','1:51:48','00:56','1:01:20','3:23:31',8,75.69),
  r(249637,menEditionId,'M','Clement Mignon',17,'25:21','1:23','1:50:42','1:02','1:08:28','3:26:54',7,71.89),
  r(249638,menEditionId,'M','Max Neumann','DNF','25:51','1:13','1:54:24','00:52'),
  r(249639,menEditionId,'M','Ben Kanute','DNF','24:51','1:04'),
  r(249640,menEditionId,'M','Bradley Weiss','DNF','25:43','1:24'),
]
