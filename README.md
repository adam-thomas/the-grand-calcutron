# The Grand Calcutron

_At the beginning of each player’s end step, if that player’s to-do list has fewer than five tasks, they add tasks equal to the difference._

A(nother) todo application, built around a hierarchical tree of items. I wanted to be able to categorise and organise a large number of items without having to rely on visual grouping within a page.

Named for [a parody Magic: the Gathering card](https://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=439520).

## Features

* Arbitrary-depth tree of tasks. Nest away!
* Responsive UI supports any size of screen, primarily by adding/removing columns of history.
* Done buttons on each task.
* Right-click tasks (or long-press on mobile) to edit or delete them.
* Drag and drop tasks to move them within the tree (desktop-only at the moment).

## Setup

* Clone the project and `cd` into the cloned directory.
* Create a virtual environment with `python3 -m venv .`.
* Activate the virtual environment with `source bin/activate`.
* Ensure Postgres is running on your system ([instructions are here](https://www.postgresql.org/) if you need to set it up).
* Install Calcutron with `make install`. Note that this will need a small amount of your input in setting up a user account - it doesn't have to be anything secure, since it's just running on your local machine for test data.

## Building and running

* Compile the React and Less code with `npm run dev`. This will also run a file watcher that recompiles the files after any changes.
* Ensure Django has access to the frontend files with `python manage.py collectstatic`.
* Run the actual server with `make run`.
* Head to `127.0.0.1:8000` in your browser to see the results!
