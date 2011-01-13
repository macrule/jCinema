#!/usr/bin/perl -w

use lib './lib';

use JSON::RPC::Server::Daemon;
my $server = JSON::RPC::Server::Daemon->new(LocalPort => 8080);
$server->dispatch({
	'/jCinemaRPC'		=> 'jCinemaRPC',
	'/jCinemaRPC/WDTV'	=> 'jCinemaRPC::WDTV',
})->handle();
