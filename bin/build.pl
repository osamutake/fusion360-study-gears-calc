#!/usr/bin/env perl
use strict;
use warnings;
use open qw/:utf8/;

sub read_file {
  my $filename = shift;
  open(my $F, "<:utf8", $filename ) or die("error :$!");
  my $text = do { local $/; <$F> };
  close($F);
  return $text;
}

sub write_file {
  my ($filename, $data) = @_;;
  open(my $F, ">:utf8", $filename) or die("error :$!");
  print $F $data;
  close($F);
}

system('parcel build src/index.html');

print "\nGenerating JS embedded html as 'dist/calc.html'.\n";

my $html = read_file('dist/index.html');
if ($html =~ /<script src="\/(index\.[^\.]+\.js)" type="module"><\/script>/) {
  my $file = $1;
  $html =~ s/<script src="\/index\.[^\.]+\.js" type="module"><\/script>//;
  my $js = read_file("dist/$file");
  $html .= "<script>\n$js\n</script>";
}
write_file('dist/calc.html', $html);
