import type { RaceResult } from '../../../../types/RaceResult'
const raceEditionId='ironman-hamburg-2025'
const r=(id:number,athleteName:string,position:RaceResult['position'],swimTime?:string,t1Time?:string,bikeTime?:string,t2Time?:string,runTime?:string,totalTime?:string,ptoPoints?:number):RaceResult=>({id,raceEditionId,gender:'W',athleteName,position,swimTime,t1Time,bikeTime,t2Time,runTime,totalTime,ptoPoints})
export const hamburg2025Results:RaceResult[]=[
r(2508001,'Laura Philipp',1,'54:40','3:39','4:23:38','2:51','2:38:27','8:03:13',95.48),
r(2508002,'Kat Matthews',2,'54:38','3:41','4:22:45','3:13','2:40:58','8:05:13',92.95),
r(2508003,'Solveig Løvseth',3,'54:38','3:39','4:24:10','3:23','2:46:40','8:12:28',88.60),
r(2508004,'Anne Reischmann',4,'58:48','3:32','4:27:35','2:45','3:00:08','8:32:46',79.56),
r(2508005,'Leonie Konczalla',5,'1:04:43','4:11','4:36:39','3:17','2:53:51','8:42:39',74.41),
r(2508006,'Danielle Lewis',6,'1:01:15','4:04','4:28:21','3:13','3:06:30','8:43:21',72.69),
r(2508007,'Jenny Jendryschik',7,'58:50','3:35','4:28:09','3:37','3:10:52','8:45:01',70.69),
r(2508008,'Rebecca Anderbury',8,'59:00','3:41','4:32:01','4:18','3:07:01','8:46:00',69.01),
r(2508009,'Henrike Gueber',9,'1:04:46','3:46','4:34:35','3:25','3:06:45','8:53:16',65.10),
r(2508010,'Johanna Ahrens',10,'55:28','3:59','4:40:36','3:37','3:22:24','9:06:02',59.25),
r(2508011,'Nicole Pelin',11,'1:11:59','4:49','5:08:22','3:46','3:06:10','9:35:04',49.73),
r(2508012,'Sabrina Exenberger',12,'1:11:45','4:18','5:10:19','5:16','3:15:03','9:46:39',48.65),
r(2508013,'Mareike Guhl',13,'1:17:50','4:27','5:19:13','5:23','3:45:48','10:32:38',47.62),
r(2508014,'Marjolaine Pierré','DNF','56:24','4:30','4:33:55'),
r(2508015,'Sara Svensk','DNF','58:51','3:28','4:49:46'),
r(2508016,'Dieuwertje Bax','DNF','1:04:34','4:40','5:03:43'),
r(2508017,'Dimity-Lee Duke','DNF','1:01:19','4:05','5:41:34'),
r(2508018,'Jackie Hering','DNF','54:44','3:42'),
r(2508019,'Stephanie Wunderle','DNF','1:04:42','4:47'),
]
