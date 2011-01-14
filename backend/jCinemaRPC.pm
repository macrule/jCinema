package jCinemaRPC;

use strict;
use base qw(JSON::RPC::Procedure);

use Cwd 'realpath';
use File::Basename;
use File::Find::Rule;
use URI::file;


our $cachedMovieList = ();


sub getUPnPHost : Public {
    my ($server, $args) = @_;
	return $server->raise_error(
		code	=> 501,
		message	=> "Not implemented."
	);
}

sub applyPatternToPath : Private {
	my ($pattern, $path) = @_;
	
 	my ($name, $dirs, $suffix) = fileparse($path, qr/\.[^.]*$/);
	
 	my $uri = $pattern;
 	$uri =~ s/\{path\}/$path/g;
 	$uri =~ s/\{dir\}/$dirs/g;
 	$uri =~ s/\{name\}/$name/g;
 	$uri =~ s/\{suffix\}/$suffix/g;
 	$uri = realpath($uri);
 	
 	if (defined $uri && -e $uri) {
 		$uri = URI::file->new($uri)->as_string;
 	} else {
 		$uri = undef;
 	}
 	
 	# returns a file uri or undef
 	return $uri;
}

sub listMovies : String(searchPath, folderImagePathPattern, thumbnailImagePathPattern, movieSheetImagePathPattern) {
    my ($server, $args) = @_;
    my $searchPath = $args->{searchPath};
	if ($searchPath =~ /^file:\/\//) {
		$searchPath = URI->new($searchPath)->path;
	}
	
	print "listMovies start $searchPath\n";
	
	# FIXME: the cache is never refreshed
 	if (!exists $cachedMovieList->{$searchPath}) {
 		my @folders;
 		my @files;
 		
 		# find directories
 		for my $path (File::Find::Rule->new
 						->extras({ follow_fast => 1 })
 						->maxdepth(1)
 						->directory
 						->name( qr/^[^._]+/ )
 						->in($searchPath)
 						) {
 			push(@folders, {
 				type				=> "folder",
 				url					=> URI::file->new($path)->as_string,
 				thumbnailImageUrl	=> applyPatternToPath($args->{thumbnailImagePathPattern}, $path),
 				title				=> fileparse($path),
 			});
 		}
 		
 		# find files
 		for my $path (File::Find::Rule->new
 						->extras({ follow_fast => 1 })
 						->maxdepth(1)
 						->file
 						->name( qr/\.(avi|m4v|mov|mp4|mkv)$/ )
 						->in($searchPath)
 						) {
 			push(@files, {
 				type				=> "file",
 				url					=> URI::file->new($path)->as_string,
 				thumbnailImageUrl	=> applyPatternToPath($args->{thumbnailImagePathPattern}, $path),
 				movieSheetImageUrl	=> applyPatternToPath($args->{movieSheetImagePathPattern}, $path),
 				title				=> fileparse($path, qr/\.[^.]*$/),
 			});
 		}
 		
 		# sort alphabetically, but folders to the top
 		my @list;
 		push(@list, sort { $a->{url} cmp $b->{url}; } @folders);
 		push(@list, sort { $a->{url} cmp $b->{url}; } @files);
 		
	 	$cachedMovieList->{$searchPath} = \@list;
 	}
	
	print "listMovies end $searchPath\n";
	
	return $cachedMovieList->{$searchPath};
}

1;
__END__
