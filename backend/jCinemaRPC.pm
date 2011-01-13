package jCinemaRPC;

use strict;
use base qw(JSON::RPC::Procedure);

use File::Basename;
use File::Find::Rule;
use URI::file;


our @cachedMovieList = ();


sub getUPnPHost : Public {
    my ($server, $args) = @_;
	return $server->raise_error(
		code	=> 501,
		message	=> "Not implemented."
	);
}

sub listMovies : String(filePath) {
    my ($server, $args) = @_;
	print "listMovies start $args->{filePath}\n";
	if (@cachedMovieList == 0) {
		for my $path (File::Find::Rule->new
						->extras({ follow_fast => 1 })
						->name( qr/\.(avi|m4v|mov|mp4|mkv)$/ )
						->in($args->{filePath})
						) {
			my ($filename, $directories, $suffix) = fileparse($path, qr/\.[^.]*/);
			my $movieSheetsPath = "${directories}_MovieSheets/${filename}";
			
			my $coverPath = "${movieSheetsPath}/thumb.jpg";
			my $sheetPath = "${movieSheetsPath}/sheet.jpg";
			if (-e $coverPath) {
				$coverPath = URI::file->new($coverPath)->as_string;
			} else {
				$coverPath = "";
			}
			if (-e $sheetPath) {
				$sheetPath = URI::file->new($sheetPath)->as_string;
			} else {
				$sheetPath = "";
			}
			
			#print "path:  $path\n";
			#print "cover: $coverPath\n";
			#print "sheet: $sheetPath\n\n";
			
			push(@cachedMovieList, {
				coverImageUrl		=> $coverPath,
				movieSheetImageUrl	=> $sheetPath,
				mediaUrl			=> URI::file->new($path)->as_string,
			});
		}
	}
	
	@cachedMovieList = sort { $a->{mediaUrl} cmp $b->{mediaUrl}; } @cachedMovieList;
	
	print "listMovies end\n";
	
	return \@cachedMovieList;
}

1;
__END__
