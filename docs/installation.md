Installation
============

Starting development
--------------------

Initial requirements:  

* `VirtualBox`  
* `Vagrant`  
* `Ansible`   
* Ask admin for Vault password :)  
* Download and isntall `VBoxGuestAdditions.iso` for your version of VirtualBox




Local server setup
---------------------------
* Init git hooks after clonning repo `git config core.hooksPath .githooks && chmod -R +x .githooks`  
* Remove `172.16.0.19` from the `~/.ssh/known_hosts` (otherwise error can occur during provision);
* Switch to project's directory
* Edit `group_vars/development.yml` faq in `docs/vault.md`
* Comment this line in Vagrantfile to allow syncing a project directory:  
   `config.vm.synced_folder ".", "/var/webapps/muzicbox/code", owner: "muzicbox_user_dev", group: "users"`
* `ansible-playbook --ask-vault-pass deployment/development.yml -i deployment/inventories/development`


Production server setup
---------------------------
* Init git hooks after clonning repo `git config core.hooksPath .githooks && chmod -R +x .githooks`  
* Switch to project's directory
* Edit `group_vars/production.yml` faq in `docs/vault.md`
* `ansible-playbook --ask-vault-pass deployment/production.yml -i deployment/inventories/production`
