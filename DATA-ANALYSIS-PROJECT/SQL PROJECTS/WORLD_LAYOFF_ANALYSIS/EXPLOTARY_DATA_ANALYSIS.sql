# EXPLOTARY DATA ANALYSIS
SELECT * FROM 
layoffs_staging2;

select max(total_laid_off),max(percentage_laid_off)
from layoffs_staging2;

select * from
layoffs_staging2 where percentage_laid_off = 1
order by funds_raised_millions desc;

select company ,sum(total_laid_off)
from layoffs_staging2
group by company
order by 2 desc;

select industry ,sum(total_laid_off)
from layoffs_staging2
group by industry
order by 2 desc;

select country ,sum(total_laid_off)
from layoffs_staging2
group by country
order by 2 desc;

select year(`date`) ,sum(total_laid_off)
from layoffs_staging2
group by year(`date`)
order by 1 desc;

select stage ,sum(total_laid_off)
from layoffs_staging2
group by stage
order by 2 desc;

select substring(`date`,1,7) as `MONTH`,sum(total_laid_off)
from layoffs_staging2
where substring(`date`,1,7) is not null
group by `MONTH`
order by 1 asc
;

with ROLLING_TOTAL AS
(
select substring(`date`,1,7) as `MONTH`,sum(total_laid_off) as total_off
from layoffs_staging2
where substring(`date`,1,7) is not null
group by `MONTH`
order by 1 asc
)
select `MONTH`,total_off,sum(total_off) over(order by `MONTH`) as rolling_total
from ROLLING_TOTAL;

select company, year(`date`) ,sum(total_laid_off)
from layoffs_staging2
group by company, year(`date`)
order by 3 desc;

with COMPANY_YEAR  (company,years,total_laid_off) AS
(
select company, year(`date`) ,sum(total_laid_off)
from layoffs_staging2
group by company, year(`date`)
),COMPANY_YEAR_RANK AS(
select *, DENSE_RANK() over (partition by years order by total_laid_off desc) as Ranking
from COMPANY_YEAR
where years is not null
order by Ranking asc  
)
SELECT * FROM COMPANY_YEAR_RANK
WHERE Ranking <= 5;