========
Overview
========

This repository contains a set of plugins for `vimperator`_:

- firebug - commands to interact with firebug
- noscript - commands to interact with noscript
- stylish - commands to interact with stylish
- readability - command to view the current page using `readability`_
- search - use your configured search engine to search the current website
- translate - translate the current page using yahoo's babel fish
- lowlight - command to set a web pages colors for low light conditions
- contrast - provides a command which attempts to alter the current page's
  background and text color to improve readability (intended for text heavy
  sites whose default colors are too bright or dark to read comfortably)

============
Installation
============

After cloning this repository you can enable all the plugins by adding the path
to your cloned repos to your .vimperatorrc:

::

  set runtimepath+=~/vimperator-plugins

If you would like to only enable a subset of these plugins, you can instead
copy or symlink the ones you want to your ``~/.vimperator/plugin`` directory.

.. _vimperator: http://www.vimperator.org
.. _readability: http://lab.arc90.com/experiments/readability/
