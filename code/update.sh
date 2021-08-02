echo "Copying resources"
cp /vagrant/resources /app -r
chmod +r /app/resources
echo "Copying code"
cp /vagrant/code /app -r
chmod +r /app/resources
echo "Creating data folder"
mkdir -p /app/data
chmod +rw /app/data
cd /app/code
echo "Installing dependencies"
pnpm install --production