@echo off
REM RGL windows build tool setup
REM This file is part of the RGL software
REM (c) 2003 D.Adler
REM $Id: setup.bat,v 1.6.4.1 2004/06/11 13:31:14 dadler Exp $

set SRC=src

REM === SETUP build tool =====================================================

set TARGET=x%1
if %TARGET% == xmingw goto mingw
if %TARGET% == xvc    goto vc
if %TARGET% == xmsvc7 goto msvc7
goto usage

REM === dump usage ===========================================================

:usage
echo usage: %0 [tool]
echo supported build tools:
echo   mingw    MinGW
echo   vc       Microsoft Visual C++
echo   msvc7    MS Visual C++ 7.0
goto return

REM === build tool: mingw ====================================================

:mingw
echo include build/mingw/Makefile >%SRC%\Makefile.win
goto done

REM === build tool: vc =======================================================

:vc
echo include build/vc/Makefile >%SRC%\Makefile.win
goto done


REM === build tool: msvc7 ====================================================

:msvc7
echo include build/msvc7/Makefile >%SRC%\Makefile.win
goto done

REM === SETUP DONE ===========================================================

:done
echo setup.bat: configured for build tool '%1'

:return
