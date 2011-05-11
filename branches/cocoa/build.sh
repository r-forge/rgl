#!/bin/sh
sudo R CMD INSTALL $* --no-multiarch --configure-args="--disable-libpng" rgl
# sudo R CMD INSTALL $* --no-multiarch --configure-args="--with-x" rgl
