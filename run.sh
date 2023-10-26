docker-compose down -v --rmi all
docker-compose build --force-rm
docker image prune --force --filter label=stage=builder
docker-compose up -d