#!/usr/bin/env node
import path = require('path')
import linkLocalPackages from '.'

const args = process.argv.slice(2)

const root = args[0] 
  ? path.resolve(args[0])
  : process.cwd()

linkLocalPackages(root)
