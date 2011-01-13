package jCinemaRPC::WDTV;

use strict;
use base qw(jCinemaRPC);

sub getUPnPHost : Public {
	my $port = `lsof -a -i4 -sTCP:LISTEN -c DMARender -F n`;
	$port =~ /n\*:(\d*)$/;
	$port = $1;
	
	my $ip = `ipaddr show scope global`;
	$ip =~ /inet ([^\/]*)\//;
	$ip = $1;
	return "$ip:$port";
}

1;
__END__
