echo "Copying resources"
cp /vagrant/resources /app/resources
echo "Copying code"
cp /vagrant/code /app/code
cd /app/code
echo "Installing dependencies"
pnpm install --production