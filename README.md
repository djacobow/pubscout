# pubscout

A web-based publications viewer/sorter for LBNL publications hosted on CDL's Symplectic Elements instance.

A running instance of this can be seen at

    https://skunkworks.lbl.gov/scout

## How it works

Pubscout gets data from three sources:

    * the HR file that LBL creates and sends to CDL on a weekly basis.
    * A list of LBNL publications curated by DOE OSTI
    * The CDL's Symplectic Elements installation

A cron job runs a series of three queries of those sources on a daily 
basis and deposits the raw data into a local folder.

After running those queries, a node.js web server can be started, which
will load those files into memory and serve up a website that allows
reasonably easy slicing and dicing of the data.

## Installation & Setup

0. Start with a blank linux system. I use Ubuntu 18.04

1. Install nginx 

`apt-get install nginx`

Configure nginx with ssl as preferred and set up forarding as such:

```
   location /scout/ {
        proxy_set_header     Host $host;
        proxy_set_header     X-Real-IP $remote_addr;
        proxy_set_header     X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header     X-Forwarded-Proto $scheme;
        proxy_read_timeout   90;
        proxy_pass           http://localhost:10001;
        client_max_body_size 32m;
        client_body_timeout  60s;
    }
```

2. Install node.js. Use NVM to get a recent stable version. As of this 
   writing, that is a 10.x.y series.

   Follow instructions here: https://github.com/nvm-sh/nvm

3. run `npm install` to get the requisite libraries

4. edit the `hrcreds.json` and `dbcreds.json` files to include your credentials
   to access the CDL ftp site, and the CDL Elements Reporting Database,
   respectively.

5. Obtain recent versions of the .csv files for the osti subfolder. These
   come from Excel spreadsheets mailed by OSTI on a regular basis

6. (optional) You can test database access by running the test.js on the 
   test/ folder

7. Adjust and install the `pubscout.service` file for systemd as necessary.

   On ubuntu systems, service files of in /etc/systemd/service. After
   copying the file, run `systemctl daemon-reload`, but do not start
   the service yet.

8. Download and prepare all the data by running `update.sh`

9. Assuming that worked, start the server by running:
   `systemctl start pubscout`

10. Set up automatic daily download of data using `update.sh` by adding it 
   as a cron job. Run `crontab -e` and then add the following line to 
   run daily at 3am:

```
0 3 * * * /home/dgj/projects/library/scout/update.sh
```

11. Set up automatic restarting of the pubs service on a daily basis.
    Unlike step 9, this should be done as root, so use `sudo crontab -e` 
    and add this line:

```
0 4 * * * sudo systemctl restart pubscout
```


### Author

Dave Jacobowitz (github djacobow)

