import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Palette, 
  BookOpen, 
  PenTool, 
  Clock, 
  Users, 
  CheckCircle, 
  ArrowRight,
  Image,
  MessageCircle,
  Mail,
  Calendar,
  Instagram,
  Facebook,
  Youtube,
  Sparkles,
  Heart
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/signup');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">Church Creator Suite</span>
            <span className="block text-blue-600 mt-2">
              Effortlessly Create Images, Bible Studies & Content
            </span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Transform your church's communication and education with our all-in-one platform designed specifically for ministry leaders, staff, and volunteers.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <button
                onClick={handleGetStarted}
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
              >
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Three Tools Section */}
      <div className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Three Powerful Tools in One
            </h2>
          </div>

          <div className="mt-20">
            <div className="grid grid-cols-1 gap-16 lg:grid-cols-3">
              {/* Image Creator */}
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600">
                  <Palette className="h-8 w-8" />
                </div>
                <h3 className="mt-6 text-2xl font-bold text-gray-900">Image Creator</h3>
                <p className="mt-4 text-gray-500 text-center">
                  Create stunning visuals for your ministry in seconds without any design skills:
                </p>
                <ul className="mt-4 space-y-3 text-gray-500">
                  <li className="flex items-center">
                    <Image className="h-5 w-5 mr-2 text-blue-500" />
                    Sunday Service Slides
                  </li>
                  <li className="flex items-center">
                    <Instagram className="h-5 w-5 mr-2 text-blue-500" />
                    Social Media Graphics
                  </li>
                  <li className="flex items-center">
                    <Heart className="h-5 w-5 mr-2 text-blue-500" />
                    Children's Ministry Materials
                  </li>
                  <li className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                    Event Announcements
                  </li>
                </ul>
              </div>

              {/* Bible Study Generator */}
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600">
                  <BookOpen className="h-8 w-8" />
                </div>
                <h3 className="mt-6 text-2xl font-bold text-gray-900">Bible Study Generator</h3>
                <p className="mt-4 text-gray-500 text-center">
                  Transform sermons and Biblical content into ready-to-use materials:
                </p>
                <ul className="mt-4 space-y-3 text-gray-500">
                  <li className="flex items-center">
                    <MessageCircle className="h-5 w-5 mr-2 text-blue-500" />
                    Small Group Discussion Guides
                  </li>
                  <li className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-2 text-blue-500" />
                    Multi-Week Bible Studies
                  </li>
                  <li className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-blue-500" />
                    Teacher-Led Outlines
                  </li>
                  <li className="flex items-center">
                    <Sparkles className="h-5 w-5 mr-2 text-blue-500" />
                    Customized Materials
                  </li>
                </ul>
              </div>

              {/* Content Assistant */}
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600">
                  <PenTool className="h-8 w-8" />
                </div>
                <h3 className="mt-6 text-2xl font-bold text-gray-900">Content Assistant</h3>
                <p className="mt-4 text-gray-500 text-center">
                  Create all the written content your church needs:
                </p>
                <ul className="mt-4 space-y-3 text-gray-500">
                  <li className="flex items-center">
                    <Facebook className="h-5 w-5 mr-2 text-blue-500" />
                    Social Media Posts
                  </li>
                  <li className="flex items-center">
                    <Mail className="h-5 w-5 mr-2 text-blue-500" />
                    Church-Wide Emails
                  </li>
                  <li className="flex items-center">
                    <Youtube className="h-5 w-5 mr-2 text-blue-500" />
                    Announcement Scripts
                  </li>
                  <li className="flex items-center">
                    <PenTool className="h-5 w-5 mr-2 text-blue-500" />
                    Newsletter Content
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              How It Works
            </h2>
          </div>

          <div className="mt-20">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Image Creator</h3>
                <ol className="space-y-4">
                  <li className="flex items-start">
                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600 text-sm font-medium mr-3">1</span>
                    <span>Choose your image type and purpose</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600 text-sm font-medium mr-3">2</span>
                    <span>Select style and dimensions</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600 text-sm font-medium mr-3">3</span>
                    <span>Add your text and preferences</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600 text-sm font-medium mr-3">4</span>
                    <span>Generate your custom image instantly</span>
                  </li>
                </ol>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Bible Study Generator</h3>
                <ol className="space-y-4">
                  <li className="flex items-start">
                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600 text-sm font-medium mr-3">1</span>
                    <span>Input your sermon or Bible passage</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600 text-sm font-medium mr-3">2</span>
                    <span>Select your audience and format</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600 text-sm font-medium mr-3">3</span>
                    <span>Customize focus areas</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600 text-sm font-medium mr-3">4</span>
                    <span>Generate complete study materials</span>
                  </li>
                </ol>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Content Assistant</h3>
                <ol className="space-y-4">
                  <li className="flex items-start">
                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600 text-sm font-medium mr-3">1</span>
                    <span>Choose your content type</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600 text-sm font-medium mr-3">2</span>
                    <span>Provide basic information</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600 text-sm font-medium mr-3">3</span>
                    <span>Select tone and length</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600 text-sm font-medium mr-3">4</span>
                    <span>Get your professional content</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Built for Church Leaders Who:
            </h2>
          </div>

          <div className="mt-20 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Clock className="h-6 w-6 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Wear Multiple Hats</h3>
              </div>
              <p className="text-gray-600">Need to save time and work efficiently across different roles</p>
            </div>

            <div className="bg-blue-50 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Palette className="h-6 w-6 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Need Design Help</h3>
              </div>
              <p className="text-gray-600">Don't have specialized design or writing skills</p>
            </div>

            <div className="bg-blue-50 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Users className="h-6 w-6 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Lead Teams</h3>
              </div>
              <p className="text-gray-600">Work with volunteer teams who need simple, effective tools</p>
            </div>

            <div className="bg-blue-50 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <CheckCircle className="h-6 w-6 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Value Quality</h3>
              </div>
              <p className="text-gray-600">Want to maintain consistent, professional content quality</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              All-Inclusive Pricing
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              One simple plan with everything you need
            </p>
          </div>

          <div className="mt-16 bg-white rounded-lg shadow-xl overflow-hidden lg:max-w-2xl lg:mx-auto">
            <div className="px-6 py-8 sm:p-10 sm:pb-6">
              <div className="flex justify-center">
                <span className="inline-flex px-4 py-1 rounded-full text-sm font-semibold tracking-wide uppercase bg-blue-100 text-blue-600">
                  Monthly Plan
                </span>
              </div>
              <div className="mt-4 flex justify-center text-6xl font-extrabold text-gray-900">
                <span className="ml-1 mr-3 text-xl font-medium text-gray-500">$</span>
                49
                <span className="ml-3 text-xl font-medium text-gray-500">/month</span>
              </div>
              <p className="mt-4 text-sm text-gray-500 text-center">
                or $499/year (save $89)
              </p>
            </div>
            <div className="px-6 pt-6 pb-8 bg-gray-50 sm:px-10 sm:py-10">
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                  <p className="ml-3 text-base text-gray-700">Unlimited image generation</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                  <p className="ml-3 text-base text-gray-700">Unlimited Bible study creation</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                  <p className="ml-3 text-base text-gray-700">Unlimited content assistance</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                  <p className="ml-3 text-base text-gray-700">Unlimited users within your church</p>
                </li>
              </ul>
              <div className="mt-10">
                <button
                  onClick={handleGetStarted}
                  className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Start Your Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
              </div>
              <p className="mt-4 text-sm text-gray-500 text-center">
                Includes 7-day money-back guarantee
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="mt-20">
            <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-12">
              <div>
                <dt className="text-lg leading-6 font-medium text-gray-900">
                  Is this really easy enough for non-technical people to use?
                </dt>
                <dd className="mt-2 text-base text-gray-500">
                  Absolutely! If you can fill out a simple online form, you can use Church Creator Suite. We designed it specifically for busy ministry leaders who don't have time to learn complicated tools.
                </dd>
              </div>

              <div>
                <dt className="text-lg leading-6 font-medium text-gray-900">
                  How many team members can use our account?
                </dt>
                <dd className="mt-2 text-base text-gray-500">
                  Your subscription covers unlimited users within your church organization. Share with staff and volunteers at no extra cost.
                </dd>
              </div>

              <div>
                <dt className="text-lg leading-6 font-medium text-gray-900">
                  Can we use these materials commercially?
                </dt>
                <dd className="mt-2 text-base text-gray-500">
                  Yes! All content created with Church Creator Suite is yours to use for your ministry purposes without any licensing concerns.
                </dd>
              </div>

              <div>
                <dt className="text-lg leading-6 font-medium text-gray-900">
                  What if we need help?
                </dt>
                <dd className="mt-2 text-base text-gray-500">
                  We offer comprehensive support resources and responsive customer service to ensure your success.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-700">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to transform your ministry content?</span>
            <span className="block text-blue-200">Get started today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <button
                onClick={handleGetStarted}
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"
              >
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}