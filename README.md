# opis-scraper-manager-2020

This project aims to scrape data from the new __constantly changing__ opis web site, in order to provide data to the [opis manager](https://github.com/UNICT-DMI/OPIS-Manager). It is written in Node.js (I wanted to learn something new 😂).
**DISCLAIMER:** I've just started learning js, so you might cringe yourself seeing how badly things might have been implemented.

I've tried to stick as much as possible to the [previous scraper](https://github.com/UNICT-DMI/opis-manager-scraper).


#### Start a local instance

* **Clone this repository**
* **Install npm**
* **Install mysql and create a new db**
* **Rename config.js.dist into congifg.js and insert your mysql username and password**
* **Cd into the folder**
* **Type the following in your shell: `npm install`**
* **Type `node scraper.js`**

### Create the db
```bash
$ mysql -u username -p
> CREATE DATABASE opis_manager;
> source /path/to/opis_manager.sql;
> exit;
```

### License
This open-source software is published under the GNU General Public License (GNU GPL) version 3. Please refer to the "LICENSE" file of this project for the full text.
