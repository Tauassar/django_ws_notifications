.DEFAULT: help
.PHONY: help bootstrap lint isort test testreport deptree clean

VENV=venv
PYTHON=$(VENV)/bin/python3

help:
	@echo "Please use \`$(MAKE) <target>' where <target> is one of the following:"
	@echo "  help       - show help information"
	@echo "  bootstrap  - setup packaging dependencies and initialize venv"
	@echo "  lint       - inspect project source code for errors"
	@echo "  isort      - sort imports according to project conventions"
	@echo "  outdated   - list outdated project requirements"
	@echo "  deptree    - show project dependency tree"
	@echo "  clean      - clean up project environment and all the build artifacts"

bootstrap: $(VENV)/bin/activate
$(VENV)/bin/activate:
	python3 -m venv $(VENV)
	$(PYTHON) -m pip install -r requirements/local.txt

lint: bootstrap
	$(PYTHON) -m flake8 --append-config src/setup.cfg src

isort: bootstrap
	$(PYTHON) -m isort src

outdated: bootstrap
	$(PYTHON) -m pip list --outdated --format=columns

deptree: bootstrap
	$(PYTHON) -m pipdeptree

clean:
	rm -rf $(VENV)

connect_django_container:
	docker-compose exec django /entrypoint bash
