package jCinemaRPC::WDTV;

use strict;
use base qw(jCinemaRPC);

sub getUPnPHost : Public {
	my $port = `lsof -a -i4 -sTCP:LISTEN -c DMARender -F n`;
	if (!defined $port) {
		return "";
	}
	
	$port =~ /n\*:(\d*)$/;
	$port = $1;
	
	my $ip = `ipaddr show scope global`;
	if (!defined $ip) {
		return "";
	}
	
	$ip =~ /inet ([^\/]*)\//;
	$ip = $1;
	
	return "$ip:$port";
}

1;
__END__
