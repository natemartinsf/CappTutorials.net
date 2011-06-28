Title: Introduction to Testing Cappuccino
Author: Derek Hammer
Date: Wed Jun 15 2011 23:25:00 GMT-0700 (PDT)
Categories: Testing

> This is a very basic introduction to unit testing in OJUnit. If you are more familiar to unit testing, you may want to look at [the API](http://280north.github.com/OJTest/docs). Learn how to test your application at Application Test (Coming Soon!). For a more advanced tutorial, look for Beyond OJUnit (Coming Soon!) and Functional Testing with CuCapp (Coming Soon!).

Part of delivering great applications in Cappuccino is learning how to effectively write tests for your application. Because Objective-J is an extremely flexible language, the question of testing does not focus on what is possible to test but rather what is valuable to test. In this guide you will learn the basics of unit testing and where you should spend time applying those skills.

## Unit Testing
Unit testing is a basic technique of writing small, executable programs that execute a single scenario at a time. There are several benefits to unit tests: organic architecture, quick feekback, executable documentation and regression test suites.

When you write a unit test, you are using the code that you either just wrote or will soon write. Because you are on the other side of the coin, you will quickly catch flaws in your architecture. Catching these flaws early makes them easier to change.

You will also run into the fact that poorly architected code is difficult to test. Classes that have too many reponsibilities, global variable usage, complicated object relationships and other signs of poor architecture make it difficult to test. In those cases, your instinct will be to make the test easier to write and fix the broken architecture.

Tests provide quick feedback about the code under test. They can tell you whether the code is broken and, if it is, why it is broken. They can help you break down a complicated algorithm or heuristic into manageable peices. In this regard, tests are actually a development tool instead of a testing tool.

If you are a large team or plan for this product to be growing for years to code, you are particularly concerned about the longevity of your code. Unit tests can help by providing a set of execuable documentation and a dependable regression suite. The execuable documentation differs from traditional comments because, well, its executable. The implications are that the tests are run along side a build process and will always be up to date. Comments, on the other hand, deteriorate over time unless your team is extremely disciplined. The regression suite is just the collection of unit tests that you have written in the past. Execute that suite during a build process and you will always have a regression suite that tells you when change A breaks component Z.

## OJUnit

OJUnit is Cappuccino's test runner. It is a rather standard xUnit framework that provides you with familiar methods like <code>assert:equals:</code>. Of course, OJUnit runs on top of Objective-J and looks a little different. It functions the same.

We will start off by creating a simple test for an array. To get started writing a test, create a Test directory in your Cappuccino application. In that directory, create a file called <code>CPArrayTest.j</code>.

> For tests in Cappuccino, we generally recommend a test-per-class style. The name of the test, then is the class name with <code>Test</code> appended. That means, for example, that <code>Coffee.j</code> and <code>Milk.j</code> would get a <code>Test/CoffeeTest.j</code> and <code>Test/MilkTest.j</code>, respectively.

In CPArrayTest, add the following lines (explanation next!):


    @implementation CPArrayTest : OJTestCase

    @end


We are merely creating a basic class. The important part to note is that CPArrayTest inherits from OJTestCase. This gives the test access to all of the assertions.

Next, we are going to add a basic test:


    - (void)testShouldReturnNilForLastObjectOfEmptyArray
    {
    	var array = [];

    	[self assertNull:[array lastObject]];
    }


Notice the name of the test and the whitespace. The test **must** begin with the prefix <code>test</code> so that the test running knows to execute that test. We also recommend that you write inquisitive test names (testShouldReturn...).

The <code>assertNil:</code> selector will test that the lastObject message sent to the empty array returns nil (just like the test asks!). If the test fails, the assertion will throw an error and the test runner will capture it as a Failure.

Speaking of the test runner, let's execute this test! From the command line, execute <code>ojtest Test/CPArrayTest.j</code>. You should get a read out similar to this:

<pre>
CPArrayTest.
All tests passed in the test suite.
</pre>

Executing a failing test looks like this:

<pre>
CPArrayTest..
addFailure test=[CPArrayTest testFail]: expected:<Cappuccino> but was:<Cocoa>

Trace not implemented

Test suite failed with 0 errors and 1 failures.
</pre>

Let us add another test that sees if the last object of an array is actually grabbed by CPArray's lastObject message.


    - (void)testShouldReturnLastObjectInArray
    {
    	var one = "ONETEST", two = "TWOTEST", three = "THREETEST";

    	var array = [one, two, three];

    	[self assert:three equals:[array lastObject]];
    }


If we execute the test, we can see that the code passes. We can take advantage of the <code>setUp</code> and <code>tearDown</code> message on your test. Set up is run before each test and tear down is run after each test. These are generally used to pull out common set up needed for each of the tests. I'll pull up the array to an instance variable and initialize it with a new array before each test.


    @implementation CPArrayTest : OJTestCase
    {
      CPArray array;
    }

    - (void)setUp
    {
      array = [];
    }

    - (void)testShouldReturnNilForLastObjectOfEmptyArray
    { 
      [self assertNull:[array lastObject]];
    } 

    - (void)testShouldReturnLastObjectInArray
    { 
      var one = "ONETEST", two = "TWOTEST",   three = "THREETEST";
      array = [one, two, three];
      [self assert:three equals:[array lastObject]];
    }

    @end


While this example is pretty contrived, you can imagine how this would be useful in tests with a common dependencies that need to be set up over and over again.

## Conclusion

By now, you should have a basic understanding of unit testing and OJUnit. Next, you should familiarize yourself with [the OJUnit API](http://280north.github.com/OJTest/docs). Learn how to test your application at Application Test (Coming Soon!). For a more advanced tutorial, look for Beyond OJUnit (Coming Soon!) and Functional Testing with CuCapp (Coming Soon!).

We gladly accept feedback on all of our tutorials. Please post a comment below!

Copyright 2011 Derek Hammer, [CC-BY-SA](http://creativecommons.org/licenses/by-sa/3.0/)