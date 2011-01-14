#!/usr/bin/perl -w

use strict;
use warnings;

use File::Basename;
use Cwd 'abs_path';
use lib abs_path(dirname($0));
use lib abs_path(dirname($0)).'/lib';

use JSON::RPC::Server::Daemon;
my $server = JSON::RPC::Server::Daemon->new(LocalPort => 8080);
$server->dispatch({
	'/jCinemaRPC'		=> 'jCinemaRPC',
	'/jCinemaRPC/WDTV'	=> 'jCinemaRPC::WDTV',
})->handle();
