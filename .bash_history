sudo apt-get update
cd ~
mkdir www
echo "HELLO WORLD" >> www/index.html
sudo chmod 755 /home /home/tin /home/tin/www
ls
cd ..
ls
cd tin
sudo apt-get install -y apache2
cd /etc/apache2/sites-available
sudo vi clbonoan.dev.conf
sudo a2ensite clbonoan.dev.conf
sudo a2dissite 000-default.conf 
sudo systemctl reload apache2
exit
clear
sudo lsof -i -P -n | grep LISTEN
nslookup clbonoan.dev
sudo vi /etc/hosts
nslookup clbonoan.dev
sudo lsof -i -P -n | grep LISTEN
sudo apache2ctl -S
sudo ufw allow OpenSSH
sudo ufw allow Apache
sudo ufw enable
sudo ufw status
sudo systemctl status apache2
sudo tail -f /var/log/auth.log
sudo ufw status
sudo apache2ctl -S
sudo vi /etc/apache2/apache2.conf 
sudo systemctl restart apache2
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
sudo certbot --apache
sudo ufw allow 'Apache Full'
exit
mkdir ~/.ssh
chmod 700 .ssh
ls
ls -la
cd .ssh/
touch authorized_keys
chmod 600 authorized_keys 
vi authorized_keys 
exit
sudo vi /etc/ssh/sshd_config
sudo systemctl restart ssh
exit
sudo systemctl restart
sudo systemctl restart ssh
sudo reboot
ls
clear
ls
cd www/
ls
exit
ls
cd www/
ls
clear
ls
vi index.html 
exit
pwd
exit
sudo vi /etc/apache2/sites-available/clbonoan.dev-le-ssl.conf 
sudo systemctl restart
sudo systemctl restart apache2
sudo systemctl daemon-reload
cd www
ls
clear
ls
vi index.html 
exit
pwd
exit
cd .ssh/
ls
clear
ls
vi authorized_keys 
exit
cd .ssh/
ls
clear
ls
vi authorized_keys 
exit
ls -la
exit
ls -la
cd .ssh/
ls
exit
cd .ssh
ls
vi authorized_keys 
exit
ls -la
exit
