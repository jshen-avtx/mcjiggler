#!/usr/bin/env node
'use strict';

const { spawn } = require('node:child_process');
const path = require('node:path');
const electron = require('electron');

spawn(String(electron), [path.join(__dirname, '..')], { stdio: 'inherit' });
