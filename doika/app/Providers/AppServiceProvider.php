<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\URL;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        if (App::environment('production')) {
            URL::forceScheme('https');
        }
        view()->composer('layouts.admin', function ($view) {
            $view->with('version', config('app.version'));
            $view->with('version_date', new \DateTime(config('app.release_date')));
        });
    }

    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }
}
