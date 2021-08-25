# opis-scraper-manager-2020

This project aims to scrape data from the new __constantly changing__ opis web site, in order to provide data to the [opis manager](https://github.com/UNICT-DMI/OPIS-Manager).  
At the time of development I was trying to learn Node.js, hence the project is fully written in that language.  
**DISCLAIMER:** I've just started learning js, so you might cringe yourself seeing how badly things might have been implemented. If you want to help feel free to do so!

I've tried to stick as much as possible to the [previous scraper](https://github.com/UNICT-DMI/opis-manager-scraper).


## Start a local instance

### Requirements
If you want to run the project using docker (a docker-compose is provided) make sure you have installed:
1. [docker](https://docs.docker.com/get-docker/)
2. [docker-compose](https://docs.docker.com/compose/)

Otherwise, if you prefer to run the project directly in "your machine" make sure you have:
1. [Node.js](https://nodejs.org/it/)
2. [npm](https://www.npmjs.com) or any of the available package managers
3. [MySQL](https://dev.mysql.com/doc/mysql-installation-excerpt/5.7/en/)
4. Created a database with the name 'opis_manager'

### Steps

1. **Clone the repo**
2. **Rename config.js.dist into congifg.js and fill with your credentials**
3. **Type the following in your shell: `npm run dev`**

### Create the db
```bash
$ mysql -u username -p
> CREATE DATABASE opis_manager;
> source /path/to/opis_manager.sql;
> exit;
```

### License
This open-source software is published under the GNU General Public License (GNU GPL) version 3. Please refer to the "LICENSE" file of this project for the full text.
