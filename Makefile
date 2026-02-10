SHELL := /bin/bash
verbosity=1

help:
	@echo "Usage:"
	@echo " make help           -- display this help"
	@echo " make install        -- install requirements and set up the database"
	@echo " make test           -- run tests"
	@echo " make run            -- run the-grand-calcutron at 127.0.0.1:8000"
	@echo " make run-external   -- run the-grand-calcutron at 0.0.0.0:8000"

install:
	python3 -m venv .
	bin/pip install -r requirements.txt
	if [ `psql -t -c "SELECT COUNT(1) FROM pg_catalog.pg_database WHERE datname = 'calcutron'"` -eq 0 ]; then \
		psql  -c "CREATE DATABASE calcutron"; \
	fi
	bin/python manage.py migrate
	bin/python manage.py createsuperuser
	npm install

test:
	@bin/python manage.py test --keepdb --verbosity=$(verbosity)

run:
	@bin/python manage.py runserver

run-external:
	@bin/python manage.py runserver 0.0.0.0:8000
