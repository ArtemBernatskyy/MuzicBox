Vagrant.configure("2") do |config|
  config.vm.box = "bento/ubuntu-16.04"
  # - - - START COMMENTING - - -
  config.vm.synced_folder ".", "/var/webapps/muzicbox/code",
    owner: "muzicbox_user_dev", group: "users"
  # - - - END COMMENTING - - -
  config.vm.box_check_update = false
  # config.vm.network "public_network", ip: "192.168.0.105"
  config.vm.network :private_network, ip: "172.16.0.19"
  config.ssh.insert_key=false
  config.vm.provider "virtualbox" do |v|
    v.memory = 512
    v.cpus = 1
    v.name = "MuzicBox"
  end
end
