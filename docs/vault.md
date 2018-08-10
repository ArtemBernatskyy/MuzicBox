Working with Vault
============

### Edit Vault file
`ansible-vault edit deployment/group_vars/production.yml`  

or alternatively you can encrypt and then decrypt it  
`ansible-vault --ask-vault-pass decrypt deployment/group_vars/production.yml`  
`ansible-vault --ask-vault-pass encrypt deployment/group_vars/production.yml`
