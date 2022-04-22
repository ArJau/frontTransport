#!/bin/bash
sudo sftp -i /var/lib/jenkins/.ssh/sftp-key sftp@s-e4b8ea4923bb49968.server.transfer.eu-west-3.amazonaws.com :/bus-transport-front << $'put -f dist/front-transport/*'