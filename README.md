A [GOV.UK](https://www.gov.uk/) exhibit
=======================================

This is a little Rack proxy and JavaScript client for synchronising the view state of multiple web browsers.

To run it:

```
$ bundle install
...
Your bundle is complete!
$ bundle exec thin start
>> Using rack adapter
>> Thin web server (v1.5.0 codename Knife)
>> Maximum connections set to 1024
>> Listening on 0.0.0.0:3000, CTRL+C to stop
```

You can then go to [http://127.0.0.1:3000/](http://127.0.0.1:3000/) to browse a proxied version of [GOV.UK](https://www.gov.uk/). If you point another browser at the same server, but use a hostname that starts with `mirror` (e.g. [http://mirror.127.0.0.1.xip.io:3000/](http://mirror.127.0.0.1.xip.io:3000/), courtesy of 37signals’ [xip.io](http://xip.io/) wildcard DNS service), you’ll get a second window that reproduces the scrolling and navigation of the first one.

See [Building a GOV.UK exhibit](http://codon.com/building-a-govuk-exhibit) for more information.
